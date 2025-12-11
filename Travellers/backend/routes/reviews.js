const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');

// @route   POST api/reviews
// @desc    Create a review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { tripId, rating, comment, images } = req.body;

    // Check if trip exists and belongs to user
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if trip is completed
    if (trip.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed trips' });
    }

    // Check if user already reviewed this trip
    const existingReview = await Review.findOne({ trip: tripId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this trip' });
    }

    const review = new Review({
      user: req.user.id,
      trip: tripId,
      rating,
      comment,
      images
    });

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/reviews
// @desc    Get all reviews for a trip
// @access  Public
router.get('/trip/:tripId', async (req, res) => {
  try {
    const reviews = await Review.find({ trip: req.params.tripId })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/reviews/user
// @desc    Get all reviews by current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('trip', 'tourType date')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get user reviews error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { rating, comment, images } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Update review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 