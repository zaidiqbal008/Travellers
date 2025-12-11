const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // admin, customer, or driver
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'customer', 'driver'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  conversationType: { type: String, enum: ['admin-customer', 'admin-driver'], required: true }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema); 