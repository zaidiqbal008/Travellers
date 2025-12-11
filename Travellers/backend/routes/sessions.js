const express = require('express');
const router = express.Router();
const UserSession = require('../models/UserSession');
const auth = require('../middleware/auth');

// @route   POST api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    // Check if session already exists for this user
    let session = await UserSession.findOne({ 
      user: req.user.id, 
      isActive: true 
    });

    if (session) {
      // Update existing session
      session.lastActivity = Date.now();
      await session.save();
    } else {
      // Create new session
      session = new UserSession({
        user: req.user.id,
        token: req.header('x-auth-token'),
        userType: req.user.userType
      });
      await session.save();
    }

    res.json(session);
  } catch (error) {
    console.error('Session creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/sessions
// @desc    Get current session
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const session = await UserSession.findOne({ 
      user: req.user.id, 
      isActive: true 
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/sessions
// @desc    Logout (deactivate session)
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const session = await UserSession.findOne({ 
      user: req.user.id, 
      isActive: true 
    });

    if (session) {
      session.isActive = false;
      await session.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/sessions/all
// @desc    Get all active sessions (admin only)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const sessions = await UserSession.find({ isActive: true })
      .populate('user', 'username email userType')
      .sort({ lastActivity: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Get all sessions error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 