const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: {
    type: String,
    unique: true
  },
  stripeSessionId: {
    type: String,
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  
  // User and booking references
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  
  // Transaction details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'pkr'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Payment metadata
  metadata: {
    carId: String,
    tourId: String,
    pickupLocation: String,
    dropLocation: String,
    date: String,
    time: String,
    passengers: Number,
    customerName: String,
    customerPhone: String,
    name: String,
    phone: String,
    message: String
  },
  
  // Refund information
  refund: {
    amount: Number,
    reason: String,
    date: Date,
    stripeRefundId: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  cancelledAt: Date
});

// Generate transaction ID before saving
PaymentTransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    const count = await this.constructor.countDocuments();
    this.transactionId = `TXN-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for efficient queries
PaymentTransactionSchema.index({ user: 1, createdAt: -1 });
PaymentTransactionSchema.index({ stripeSessionId: 1 });
PaymentTransactionSchema.index({ status: 1 });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema); 