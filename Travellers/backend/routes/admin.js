const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT api/admin/bookings/:bookingId/assign
// @desc    Assign booking to driver
// @access  Private (Admin only)
router.put('/bookings/:bookingId/assign', auth, adminAuth, async (req, res) => {
  try {
    const { driverId } = req.body;
    const { bookingId } = req.params;

    // Check if driver exists and is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.userType !== 'driver') {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }

    // Find and update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.assignedDriver = driverId;
    booking.status = 'assigned';
    await booking.save();

    // Populate the assignedDriver in the response
    const populatedBooking = await Booking.findById(bookingId)
      .populate('assignedDriver', 'username email')
      .populate('user', 'username email');

    res.json({ 
      message: 'Booking assigned successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Assign booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/admin/bookings/:bookingId/status
// @desc    Update booking status
// @access  Private (Admin only)
router.put('/bookings/:bookingId/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;

    const validStatuses = ['pending', 'confirmed', 'assigned', 'completed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Populate the assignedDriver in the response
    const populatedBooking = await Booking.findById(bookingId)
      .populate('assignedDriver', 'username email')
      .populate('user', 'username email');

    res.json({ 
      message: 'Booking status updated successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/admin/bookings/:bookingId/driver-status
// @desc    Update booking status by assigned driver (handles both ride bookings and tour bookings)
// @access  Private (Driver only)
router.put('/bookings/:bookingId/driver-status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;

    // Check if user is a driver
    if (req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Drivers only.' });
    }

    const validStatuses = ['completed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Drivers can only mark as completed or canceled.' });
    }

    // Try to find as a ride booking first
    let booking = await Booking.findById(bookingId);
    let isTourBooking = false;

    if (!booking) {
      // If not found as ride booking, try as tour booking
      const Trip = require('../models/Trip');
      booking = await Trip.findById(bookingId);
      isTourBooking = true;
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking is assigned to this driver
    if (booking.assignedDriver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update your assigned bookings.' });
    }

    // Check if booking is in assigned/confirmed status
    const validCurrentStatuses = isTourBooking ? ['confirmed'] : ['assigned'];
    if (!validCurrentStatuses.includes(booking.status)) {
      return res.status(400).json({ 
        message: `Can only update ${isTourBooking ? 'tour bookings' : 'bookings'} with ${validCurrentStatuses.join(' or ')} status.` 
      });
    }

    booking.status = status;
    await booking.save();

    // Populate the assignedDriver in the response
    if (isTourBooking) {
      const Trip = require('../models/Trip');
      const populatedBooking = await Trip.findById(bookingId)
        .populate('assignedDriver', 'username email')
        .populate('user', 'username email');

      res.json({ 
        message: 'Tour booking status updated successfully',
        booking: populatedBooking
      });
    } else {
      const populatedBooking = await Booking.findById(bookingId)
        .populate('assignedDriver', 'username email')
        .populate('user', 'username email');

      res.json({ 
        message: 'Booking status updated successfully',
        booking: populatedBooking
      });
    }
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/admin/trips/:tripId/assign
// @desc    Assign trip to driver
// @access  Private (Admin only)
router.put('/trips/:tripId/assign', auth, adminAuth, async (req, res) => {
  try {
    const { driverId } = req.body;
    const { tripId } = req.params;

    // Check if driver exists and is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.userType !== 'driver') {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }

    // Find and update trip
    const Trip = require('../models/Trip');
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.assignedDriver = driverId;
    trip.status = 'confirmed';
    await trip.save();

    // Populate the assignedDriver in the response
    const populatedTrip = await Trip.findById(tripId)
      .populate('assignedDriver', 'username email')
      .populate('user', 'username email');

    res.json({ 
      message: 'Trip assigned successfully',
      trip: populatedTrip
    });
  } catch (error) {
    console.error('Assign trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/admin/trips/:tripId/status
// @desc    Update trip status
// @access  Private (Admin only)
router.put('/trips/:tripId/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { tripId } = req.params;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const Trip = require('../models/Trip');
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.status = status;
    await trip.save();

    // Populate the assignedDriver in the response
    const populatedTrip = await Trip.findById(tripId)
      .populate('assignedDriver', 'username email')
      .populate('user', 'username email');

    res.json({ 
      message: 'Trip status updated successfully',
      trip: populatedTrip
    });
  } catch (error) {
    console.error('Update trip status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/admin/drivers/:driverId/bookings
// @desc    Get all bookings for a specific driver
// @access  Private (Admin only)
router.get('/drivers/:driverId/bookings', auth, adminAuth, async (req, res) => {
  try {
    const { driverId } = req.params;

    const bookings = await Booking.find({ assignedDriver: driverId })
      .populate('user', 'username email')
      .populate('assignedDriver', 'username email')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get driver bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 