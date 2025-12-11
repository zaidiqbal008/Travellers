const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Information
  fullName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  // Contact Information
  phone: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Driver Specific Information
  driverInfo: {
    // Removed all car-related fields
  },
  // Cars owned/added by the driver
  cars: [
    {
      image: { type: String }, // file path or URL
      model: { type: String, required: true },
      color: { type: String, required: true },
      registration: { type: String, required: true },
      seats: { type: Number, required: true },
      ac: { type: Boolean, required: true },
      year: { type: Number },
      fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], default: 'petrol' },
      transmission: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
      status: { type: String, enum: ['available', 'maintenance', 'booked'], default: 'available' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  // Customer Specific Information
  customerInfo: {
    preferredPaymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash'
    },
    totalBookings: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    favoriteRoutes: [String],
    savedAddresses: [{
      name: String,
      address: String,
      isDefault: Boolean
    }]
  },
  // Admin Specific Information
  adminInfo: {
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'],
      default: 'admin'
    },
    permissions: [String],
    lastLogin: Date
  },
  // General Settings
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    location: String
  }],
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
UserProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserProfile', UserProfileSchema); 