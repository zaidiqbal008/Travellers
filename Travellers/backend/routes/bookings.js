const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Test endpoints for development (no auth required) - MUST BE FIRST
// @route   POST api/bookings/test
// @desc    Create a test booking (no auth required)
// @access  Public
router.post('/test', async (req, res) => {
  try {
    console.log('Creating test booking:', req.body);
    
    const booking = new Booking({
      user: '687ba41743a6528dd4eb5df1', // Test user ID
      carName: req.body.carName,
      pickupLocation: req.body.pickupLocation,
      dropLocation: req.body.dropLocation,
      date: req.body.date,
      time: req.body.time,
      passengers: req.body.passengers,
      totalAmount: req.body.totalAmount,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      message: req.body.message,
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'pending'
    });

    await booking.save();
    console.log('Test booking saved:', booking._id);
    
    res.json(booking);
  } catch (error) {
    console.error('Test booking creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bookings/test
// @desc    Get all test bookings (no auth required)
// @access  Public
router.get('/test', async (req, res) => {
  try {
    console.log('Fetching all test bookings...');
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    console.log('Found bookings:', bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error('Test bookings fetch error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      carName,
      pickupLocation,
      dropLocation,
      date,
      time,
      passengers,
      totalAmount
    } = req.body;

    const booking = new Booking({
      user: req.user.id,
      carName,
      pickupLocation,
      dropLocation,
      date,
      time,
      passengers,
      totalAmount,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone
    });

    await booking.save();

    // Return booking
    res.json(booking.toObject());

  } catch (error) {
    console.error('Booking creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bookings/user
// @desc    Get all bookings for current user with enhanced data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    console.log('Getting bookings for user:', req.user.id);
    
    const bookings = await Booking.find({ user: req.user.id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    console.log('Found bookings:', bookings.length);

    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      carName: booking.carName,
      pickupLocation: booking.pickupLocation,
      dropLocation: booking.dropLocation,
      date: booking.date,
      time: booking.time,
      passengers: booking.passengers,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingNumber: booking.bookingNumber,
      stripeSessionId: booking.stripeSessionId,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      paymentDetails: booking.paymentDetails,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt
    }));

    res.json({ 
      bookings: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error('Get user bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bookings/all
// @desc    Get all bookings (admin only)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const bookings = await Booking.find({})
      .populate('user', 'username email')
      .populate('assignedDriver', 'username email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bookings/driver
// @desc    Get all bookings assigned to current driver (both ride bookings and tour bookings)
// @access  Private (Driver only)
router.get('/driver', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Drivers only.' });
    }

    console.log('Driver bookings request for user:', req.user.id, req.user.username);

    // Get ride bookings (from Booking model)
    const rideBookings = await Booking.find({ assignedDriver: req.user.id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    console.log('Ride bookings found:', rideBookings.length);

    // Get tour bookings (from Trip model)
    const Trip = require('../models/Trip');
    const tourBookings = await Trip.find({ assignedDriver: req.user.id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    console.log('Tour bookings found:', tourBookings.length);
    console.log('Tour bookings details:', tourBookings.map(t => ({ id: t._id, name: t.name, status: t.status })));

    // Combine both types of bookings
    const allBookings = [
      ...rideBookings.map(booking => ({
        ...booking.toObject(),
        bookingType: 'ride'
      })),
      ...tourBookings.map(trip => ({
        ...trip.toObject(),
        bookingType: 'tour',
        // Map trip fields to match booking structure for consistency
        pickupLocation: trip.name || 'Tour Pickup',
        dropLocation: trip.tourType || 'Tour Destination',
        carName: trip.vehicle || 'Tour Vehicle',
        customerPhone: trip.phone || 'N/A',
        customerName: trip.name || 'Tour Customer'
      }))
    ];

    // Sort by creation date (newest first)
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('Total combined bookings:', allBookings.length);
    console.log('Combined bookings types:', allBookings.map(b => ({ id: b._id, type: b.bookingType, status: b.status })));

    res.json({ bookings: allBookings });
  } catch (error) {
    console.error('Get driver bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await booking.remove();
    res.json({ message: 'Booking removed' });
  } catch (error) {
    console.error('Delete booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 