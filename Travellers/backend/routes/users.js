const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users by type (customer or driver), excluding certain usernames
// GET /api/users?type=customer or type=driver
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    if (!type || !['customer', 'driver'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }
    const users = await User.find({
      userType: type,
      username: { $nin: ['travellersfyp', 'travellers1234'] }
    }).select('_id username email userType phone');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'phone'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 