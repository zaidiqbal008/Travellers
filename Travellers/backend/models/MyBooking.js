const mongoose = require('mongoose');

const MyBookingSchema = new mongoose.Schema({
  // User information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Booking information
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  bookingType: {
    type: String,
    enum: ['ride', 'tour'],
    required: true
  },
  
  // Ride booking details
  carName: {
    type: String,
    default: null
  },
  pickupLocation: {
    type: String,
    default: null
  },
  dropLocation: {
    type: String,
    default: null
  },
  
  // Tour booking details
  tourType: {
    type: String,
    default: null
  },
  tourName: {
    type: String,
    default: null
  },
  
  // Common booking details
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
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Customer details
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  paymentDate: {
    type: Date,
    default: null
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Receipt information
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptNumber: {
    type: String,
    default: null
  },
  receiptFilePath: {
    type: String,
    default: null
  },
  receiptFileName: {
    type: String,
    default: null
  },
  
  // Additional information
  message: {
    type: String,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Generate booking number
MyBookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.bookingNumber = `BK-${timestamp}-${random}`;
  }
  
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  
  next();
});

// Generate receipt number when payment is successful
MyBookingSchema.methods.generateReceiptNumber = function() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `RCP-${timestamp}-${random}`;
};

module.exports = mongoose.model('MyBooking', MyBookingSchema); 