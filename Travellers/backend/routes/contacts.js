const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// @route   POST api/contacts
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      subject,
      message
    });

    await contact.save();
    res.json({ message: 'Contact form submitted successfully', contact });
  } catch (error) {
    console.error('Contact submission error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/contacts (with user)
// @desc    Submit contact form with authenticated user
// @access  Private
router.post('/user', auth, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = new Contact({
      user: req.user.id,
      name,
      email,
      subject,
      message
    });

    await contact.save();
    res.json({ message: 'Contact form submitted successfully', contact });
  } catch (error) {
    console.error('Contact submission error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/contacts
// @desc    Get all contacts (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/contacts/:id
// @desc    Update contact status (admin only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 