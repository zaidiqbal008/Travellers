const express = require('express');
const router = express.Router();
const MyBooking = require('../models/MyBooking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const ReceiptGenerator = require('../utils/receiptGenerator');
const path = require('path');
const fs = require('fs-extra');

// @route   POST api/mybookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      bookingType,
      carName,
      pickupLocation,
      dropLocation,
      tourType,
      tourName,
      date,
      time,
      passengers,
      totalAmount,
      customerName,
      customerPhone,
      customerEmail,
      message
    } = req.body;

    // Create new booking
    const booking = new MyBooking({
      user: req.user.id,
      bookingType,
      carName,
      pickupLocation,
      dropLocation,
      tourType,
      tourName,
      date,
      time,
      passengers,
      totalAmount,
      customerName,
      customerPhone,
      customerEmail,
      message
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Booking created successfully',
      booking: booking
    });

  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/mybookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await MyBooking.find({ user: req.user.id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Get bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/mybookings/driver
// @desc    Get all bookings for driver (admin access)
// @access  Private
router.get('/driver', auth, async (req, res) => {
  try {
    // Check if user is admin or driver
    if (req.user.userType !== 'admin' && req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await MyBooking.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Get driver bookings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/mybookings/:id
// @desc    Get specific booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id)
      .populate('user', 'username email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      booking: booking
    });

  } catch (error) {
    console.error('Get booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/mybookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update allowed fields
    const { customerName, customerPhone, message, status } = req.body;
    if (customerName) booking.customerName = customerName;
    if (customerPhone) booking.customerPhone = customerPhone;
    if (message) booking.message = message;
    if (status) booking.status = status;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: booking
    });

  } catch (error) {
    console.error('Update booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/mybookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/mybookings/:id/generate-receipt
// @desc    Generate receipt for booking
// @access  Private
router.post('/:id/generate-receipt', auth, async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id)
      .populate('user', 'username email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if payment is completed
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment must be completed before generating receipt' });
    }

    // Generate receipt
    const receiptGenerator = new ReceiptGenerator();
    const receiptNumber = booking.generateReceiptNumber();
    
    let receiptData;
    if (booking.bookingType === 'ride') {
      receiptData = await receiptGenerator.generateBookingReceipt(booking, booking.user);
    } else {
      receiptData = await receiptGenerator.generateTourReceipt(booking, booking.user);
    }

    // Update booking with receipt information
    booking.receiptGenerated = true;
    booking.receiptNumber = receiptNumber;
    booking.receiptFilePath = receiptData.filePath;
    booking.receiptFileName = receiptData.fileName;

    await booking.save();

    res.json({
      success: true,
      message: 'Receipt generated successfully',
      receipt: {
        number: receiptNumber,
        fileName: receiptData.fileName,
        downloadUrl: `/api/mybookings/${booking._id}/download-receipt`
      }
    });

  } catch (error) {
    console.error('Generate receipt error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/mybookings/:id/download-receipt
// @desc    Download receipt for booking
// @access  Private
router.get('/:id/download-receipt', auth, async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if receipt exists
    if (!booking.receiptGenerated || !booking.receiptFilePath) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const filePath = path.join(__dirname, '..', booking.receiptFilePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Receipt file not found' });
    }

    res.download(filePath, booking.receiptFileName);

  } catch (error) {
    console.error('Download receipt error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/mybookings/:id/update-payment
// @desc    Update payment status (called by webhook)
// @access  Private
router.post('/:id/update-payment', auth, async (req, res) => {
  try {
    const { paymentStatus, stripeSessionId } = req.body;
    
    const booking = await MyBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update payment information
    booking.paymentStatus = paymentStatus;
    if (stripeSessionId) booking.stripeSessionId = stripeSessionId;
    if (paymentStatus === 'paid') {
      booking.paymentDate = new Date();
      booking.status = 'confirmed';
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      booking: booking
    });

  } catch (error) {
    console.error('Update payment error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 