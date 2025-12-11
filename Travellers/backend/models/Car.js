const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String
  },
  model: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  registration: {
    type: String,
    required: true,
    unique: true
  },
  seats: {
    type: Number,
    required: true
  },
  ac: {
    type: Boolean,
    required: true
  },
  year: {
    type: Number
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['available', 'maintenance', 'booked'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CarSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Car', CarSchema); 