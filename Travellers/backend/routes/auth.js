const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const validator = require('validator');
const UserSession = require('../models/UserSession');
const { io } = require('../server');

// @route   POST api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, userType, dob, phone } = req.body;
    console.log('Signup attempt:', { username, email, userType });

    // Validate required fields
    if (!username || !email || !password || !userType) {
      return res.status(400).json({ 
        message: 'All fields are required: username, email, password, userType' 
      });
    }

    // Validate userType
    const validUserTypes = ['customer', 'driver', 'admin'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type. Must be customer, driver, or admin' 
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      userType,
      dob: dob ? new Date(dob) : undefined,
      phone
    });

    // Save user to database
    await user.save();
    console.log('User saved successfully:', { id: user._id, email: user.email });

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ message: 'Error creating authentication token' });
        }
        res.json({ 
          message: 'User registered successfully',
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            userType: user.userType
          }
        });
      }
    );
  } catch (err) {
    console.error('Signup error:', err.message);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: errors.join(', ') 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during signup. Please try again.' 
    });
  }
});

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Special handling for the admin user: permanently elevate their role in the DB
    if (user.email === 'admin@gmail.com' && user.userType !== 'admin') {
      user.userType = 'admin';
      await user.save(); // Save the change to the database
      console.log(`User ${user.email} has been elevated to admin.`);
    }

    // Special handling for the customer user: ensure they are marked as customer
    if (user.email === 'customer@gmail.com' && user.userType !== 'customer') {
      user.userType = 'customer';
      await user.save(); // Save the change to the database
      console.log(`User ${user.email} has been set as customer.`);
    }

    // Special handling for the driver user: ensure they are marked as driver
    if (user.email === 'driver@gmail.com' && user.userType !== 'driver') {
      user.userType = 'driver';
      await user.save(); // Save the change to the database
      console.log(`User ${user.email} has been set as driver.`);
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        console.log('Login successful for user:', email);
        
        // Set HTTP-only cookie with JWT token
        res.cookie('token', token, {
          httpOnly: true,
          secure: false, // Set to false for local HTTP development
          sameSite: 'lax', // Set to 'lax' for local HTTP development
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({
          message: 'Login successful',
          token: token, // Add token to response
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            userType: user.userType,
            phone: user.phone,
            profilePicture: user.profilePicture
          }
        });

        // Emit Socket.IO event for real-time status tracking
        if (io) {
          io.emit('user_status_changed', {
            userId: user._id,
            status: 'active',
            userType: user.userType,
            username: user.username
          });
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending password reset email' });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    console.log('🔄 Password reset attempt:');
    console.log('Token:', req.params.token);
    console.log('New password length:', password ? password.length : 'undefined');
    
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ User not found or token expired');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log('✅ User found:', user.email);
    console.log('📊 Old password hash:', user.password);
    console.log('📊 Old password hash length:', user.password.length);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log('✅ Password updated successfully');
    console.log('📊 New password hash:', user.password);
    console.log('📊 New password hash length:', user.password.length);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, phone, profilePicture } = req.body;
    const user = await User.findById(req.user.id);

    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Get user details before logout
    const user = await User.findById(req.user.id).select('username userType');
    
    // Deactivate session in MongoDB
    await UserSession.findOneAndUpdate(
      { user: req.user.id, isActive: true },
      { isActive: false }
    );

    // Clear the cookie
    res.clearCookie('token');
    
    res.json({ message: 'Logged out successfully' });

    // Emit Socket.IO event for real-time status tracking
    if (io && user) {
      io.emit('user_status_changed', {
        userId: req.user.id,
        status: 'inactive',
        userType: user.userType,
        username: user.username
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router; 