const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tourType: {
    type: String,
    required: true,
    enum: [
      'NARAN KAGHAN TOUR',
      'ABBOTTBAD TOUR',
      'AZAD KASHMIR TOUR',
      'HARNOI WATERFALL TOUR',
      'AYUBIA PIPELINE TOUR',
      'NATHIA GALI TOUR'
    ]
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  passengers: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
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
  // Trip tracking
  tripNumber: {
    type: String,
    unique: true
  },
  // Additional trip details
  tourDuration: Number, // in days
  tourGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  confirmedAt: Date,
  completedAt: Date,
  canceledAt: Date
});

// Generate trip number before saving
TripSchema.pre('save', async function(next) {
  if (this.isNew && !this.tripNumber) {
    const count = await this.constructor.countDocuments();
    this.tripNumber = `TR-${Date.now()}-${count + 1}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Trip', TripSchema); 