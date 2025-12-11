const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carName: {
    type: String,
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  dropLocation: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  passengers: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'completed', 'canceled'],
    default: 'pending'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  stripeSessionId: {
    type: String
  },
  // Enhanced payment tracking
  paymentDetails: {
    stripePaymentIntentId: String,
    paymentMethod: String,
    currency: {
      type: String,
      default: 'pkr'
    },
    paymentDate: Date,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String
  },
  // Booking tracking
  bookingNumber: {
    type: String,
    unique: true
  },
  // Additional booking details
  specialRequests: String,
  estimatedDuration: Number, // in minutes
  distance: Number, // in kilometers
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  completedAt: Date,
  canceledAt: Date
});

// Generate booking number before saving
BookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingNumber) {
    const count = await this.constructor.countDocuments();
    this.bookingNumber = `BK-${Date.now()}-${count + 1}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema, 'ride booking'); 