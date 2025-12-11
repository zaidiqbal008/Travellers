const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// @route   POST api/feedback
// @desc    Submit feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email, feedback, rating } = req.body;

    const feedbackEntry = new Feedback({
      email,
      feedback,
      rating
    });

    await feedbackEntry.save();
    res.json({ message: 'Feedback submitted successfully', feedback: feedbackEntry });
  } catch (error) {
    console.error('Feedback submission error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/feedback (with user)
// @desc    Submit feedback with authenticated user
// @access  Private
router.post('/user', auth, async (req, res) => {
  try {
    const { email, feedback, rating } = req.body;

    const feedbackEntry = new Feedback({
      user: req.user.id,
      email,
      feedback,
      rating
    });

    await feedbackEntry.save();
    res.json({ message: 'Feedback submitted successfully', feedback: feedbackEntry });
  } catch (error) {
    console.error('Feedback submission error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/feedback
// @desc    Get all feedback (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbackList);
  } catch (error) {
    console.error('Get feedback error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/feedback/:id
// @desc    Delete feedback (admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.remove();
    res.json({ message: 'Feedback removed' });
  } catch (error) {
    console.error('Delete feedback error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 