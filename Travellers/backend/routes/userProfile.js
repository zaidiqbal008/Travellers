const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage for profile pictures
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/profilePics';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF images are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Multer storage for car images
const carImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/driverCars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCarImage = multer({
  storage: carImageStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF images are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// @route   GET api/userprofile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user.id }).populate('user', ['username', 'email', 'userType', 'phone']);
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = new UserProfile({
        user: req.user.id,
        fullName: req.user.username,
        phone: req.user.phone || ''
      });
      await profile.save();
      profile = await UserProfile.findOne({ user: req.user.id }).populate('user', ['username', 'email', 'userType', 'phone']);
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/userprofile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      phone,
      emergencyContact,
      bio,
      driverInfo,
      customerInfo,
      adminInfo,
      preferences
    } = req.body;

    let profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = new UserProfile({
        user: req.user.id
      });
    }

    // Update fields
    if (fullName) profile.fullName = fullName;
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (address) profile.address = address;
    if (phone) profile.phone = phone;
    if (emergencyContact) profile.emergencyContact = emergencyContact;
    if (bio) profile.bio = bio;
    if (driverInfo) profile.driverInfo = { ...profile.driverInfo, ...driverInfo };
    if (customerInfo) profile.customerInfo = { ...profile.customerInfo, ...customerInfo };
    if (adminInfo) profile.adminInfo = { ...profile.adminInfo, ...adminInfo };
    if (preferences) profile.preferences = { ...profile.preferences, ...preferences };

    // Also update the User model for fields like phone
    if (phone) {
      const user = await User.findById(req.user.id);
      user.phone = phone;
      await user.save();
    }

    profile.lastActivity = Date.now();
    
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/userprofile/activity
// @desc    Log user activity
// @access  Private
router.post('/activity', auth, async (req, res) => {
  try {
    const { ipAddress, userAgent, location } = req.body;
    
    let profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = new UserProfile({
        user: req.user.id
      });
    }

    // Add to login history
    profile.loginHistory.push({
      timestamp: Date.now(),
      ipAddress,
      userAgent,
      location
    });

    // Keep only last 10 login records
    if (profile.loginHistory.length > 10) {
      profile.loginHistory = profile.loginHistory.slice(-10);
    }

    profile.lastActivity = Date.now();
    await profile.save();
    
    res.json({ message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET api/userprofile/driver/:id
// @desc    Get driver profile by ID
// @access  Public
router.get('/driver/:id', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.params.id })
      .populate('user', ['username', 'email', 'userType'])
      .select('fullName driverInfo rating totalRides');
    
    if (!profile) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/userprofile/driver/rating
// @desc    Update driver rating
// @access  Private
router.put('/driver/rating', auth, async (req, res) => {
  try {
    const { driverId, rating } = req.body;
    
    const profile = await UserProfile.findOne({ user: driverId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }
    
    // Update rating (simple average for now)
    const currentRating = profile.driverInfo.rating || 0;
    const totalRides = profile.driverInfo.totalRides || 0;
    
    if (totalRides === 0) {
      profile.driverInfo.rating = rating;
    } else {
      profile.driverInfo.rating = ((currentRating * totalRides) + rating) / (totalRides + 1);
    }
    
    profile.driverInfo.totalRides = totalRides + 1;
    await profile.save();
    
    res.json({ 
      message: 'Rating updated successfully',
      newRating: profile.driverInfo.rating,
      totalRides: profile.driverInfo.totalRides
    });
  } catch (error) {
    console.error('Update driver rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/userprofile/profile-pic
// @desc    Upload profile picture
// @access  Private
router.post('/profile-pic', auth, uploadProfilePic.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove old profile picture if it exists
    if (user.profilePicture) {
      const oldFilePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user with new profile picture path
    user.profilePicture = `/uploads/profilePics/${req.file.filename}`;
    await user.save();

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error uploading profile picture' });
  }
});

// @route   DELETE api/userprofile/profile-pic
// @desc    Remove profile picture
// @access  Private
router.delete('/profile-pic', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove profile picture file if it exists
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Clear profile picture path
    user.profilePicture = '';
    await user.save();

    res.json({ 
      message: 'Profile picture removed successfully',
      profilePicture: ''
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ message: 'Server error removing profile picture' });
  }
});

// @route   GET api/userprofile/cars
// @desc    Get all cars for current driver
// @access  Private
router.get('/cars', auth, async (req, res) => {
  try {
    const cars = await Car.find({ driver: req.user.id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/userprofile/cars
// @desc    Add a new car for current driver
// @access  Private
router.post('/cars', auth, uploadCarImage.single('image'), async (req, res) => {
  try {
    const { model, color, registration, seats, ac, year, fuelType, transmission } = req.body;
    if (!model || !color || !registration || !seats || typeof ac === 'undefined') {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if registration number already exists
    const existingCar = await Car.findOne({ registration });
    if (existingCar) {
      return res.status(400).json({ message: 'Car with this registration number already exists' });
    }
    
    const car = new Car({
      driver: req.user.id,
      image: req.file ? `/uploads/driverCars/${req.file.filename}` : '',
      model,
      color,
      registration,
      seats: Number(seats),
      ac: ac === 'true' || ac === true,
      year: year ? Number(year) : undefined,
      fuelType: fuelType || 'petrol',
      transmission: transmission || 'manual',
      status: 'available'
    });
    
    await car.save();
    res.json(car);
  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/userprofile/cars/:carId
// @desc    Update a car for current driver
// @access  Private
router.put('/cars/:carId', auth, uploadCarImage.single('image'), async (req, res) => {
  try {
    const { model, color, registration, seats, ac, year, fuelType, transmission, status } = req.body;
    
    const car = await Car.findOne({ _id: req.params.carId, driver: req.user.id });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    // Check if registration number already exists (excluding current car)
    if (registration && registration !== car.registration) {
      const existingCar = await Car.findOne({ registration, _id: { $ne: req.params.carId } });
      if (existingCar) {
        return res.status(400).json({ message: 'Car with this registration number already exists' });
      }
    }
    
    if (model) car.model = model;
    if (color) car.color = color;
    if (registration) car.registration = registration;
    if (seats) car.seats = Number(seats);
    if (typeof ac !== 'undefined') car.ac = ac === 'true' || ac === true;
    if (year) car.year = Number(year);
    if (fuelType) car.fuelType = fuelType;
    if (transmission) car.transmission = transmission;
    if (status) car.status = status;
    
    if (req.file) {
      // Remove old image if exists
      if (car.image) {
        const oldFilePath = path.join(__dirname, '..', car.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      car.image = `/uploads/driverCars/${req.file.filename}`;
    }
    
    await car.save();
    res.json(car);
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/userprofile/cars/:carId
// @desc    Delete a car for current driver
// @access  Private
router.delete('/cars/:carId', auth, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.carId, driver: req.user.id });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    // Remove car image if exists
    if (car.image) {
      const imagePath = path.join(__dirname, '..', car.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete car from database
    await Car.findByIdAndDelete(req.params.carId);
    
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 