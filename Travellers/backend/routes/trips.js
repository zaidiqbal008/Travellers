const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Test endpoints for development (no auth required) - MUST BE FIRST
// @route   POST api/trips/test
// @desc    Create a test trip (no auth required)
// @access  Public
router.post('/test', async (req, res) => {
  try {
    console.log('Creating test trip:', req.body);
    
    const trip = new Trip({
      user: '687ba41743a6528dd4eb5df1', // Test user ID
      tourType: req.body.tourType,
      name: req.body.name,
      phone: req.body.phone,
      passengers: req.body.passengers,
      date: req.body.date,
      time: req.body.time,
      message: req.body.message,
      totalAmount: req.body.totalAmount,
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'pending'
    });

    await trip.save();
    console.log('Test trip saved:', trip._id);
    
    res.json(trip);
  } catch (error) {
    console.error('Test trip creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/trips/test
// @desc    Get all test trips (no auth required)
// @access  Public
router.get('/test', async (req, res) => {
  try {
    console.log('Fetching all test trips...');
    const trips = await Trip.find({}).sort({ createdAt: -1 });
    console.log('Found trips:', trips.length);
    res.json(trips);
  } catch (error) {
    console.error('Test trips fetch error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/trips
// @desc    Get all trips for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all trips (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const trips = await Trip.find()
      .populate('user', 'username email')
      .populate('assignedDriver', 'username email')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get all trips error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET trip by ID (must come after /all)
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/trips
// @desc    Create a new trip booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      tourType,
      name,
      phone,
      passengers,
      date,
      time,
      message,
      totalAmount
    } = req.body;

    const trip = new Trip({
      user: req.user.id,
      tourType,
      name,
      phone,
      passengers,
      date,
      time,
      message,
      totalAmount
    });

    await trip.save();

    // Return trip
    res.json(trip.toObject());
  } catch (error) {
    console.error('Create trip error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Only allow updating certain fields
    const { name, phone, passengers, message } = req.body;
    if (name) trip.name = name;
    if (phone) trip.phone = phone;
    if (passengers) trip.passengers = passengers;
    if (message) trip.message = message;

    await trip.save();
    res.json(trip);
  } catch (error) {
    console.error('Update trip error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/trips/:id
// @desc    Cancel trip
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update status to cancelled
    trip.status = 'cancelled';
    await trip.save();

    res.json({ message: 'Trip cancelled successfully' });
  } catch (error) {
    console.error('Cancel trip error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 