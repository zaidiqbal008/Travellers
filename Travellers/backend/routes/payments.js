const express = require('express');
const router = express.Router();
const stripe = require('../utils/stripe');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');

// Create Stripe Checkout Session for Car Booking
router.post('/create-car-session', async (req, res) => {
  const { carId, userId, amount, pickupLocation, dropLocation, date, time, passengers, customerName, customerPhone } = req.body;
  
  try {
    console.log('Creating car booking session with data:', {
      carId, userId, amount, pickupLocation, dropLocation, date, time, passengers, customerName, customerPhone
    });

    // Validate required fields
    if (!carId || !userId || !amount || !pickupLocation || !dropLocation || !date || !time || !passengers || !customerName || !customerPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['carId', 'userId', 'amount', 'pickupLocation', 'dropLocation', 'date', 'time', 'passengers', 'customerName', 'customerPhone']
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'pkr',
          product_data: {
            name: `Car Booking: ${carId}`,
            description: `Pickup: ${pickupLocation} | Drop: ${dropLocation} | Date: ${date} | Time: ${time} | Passengers: ${passengers}`,
          },
          unit_amount: Math.round(amount * 100), // amount in pkr, ensure it's an integer
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/customer?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/customer?payment=cancelled',
      metadata: { 
        carId, 
        userId,
        pickupLocation,
        dropLocation,
        date,
        time,
        passengers: passengers.toString(),
        customerName,
        customerPhone
      }
    });

    console.log('Stripe session created successfully:', session.id);
    
    // Try to find and update existing booking with session ID
    try {
      const existingBooking = await Booking.findOne({
        carName: carId,
        customerName: customerName,
        customerPhone: customerPhone,
        paymentStatus: 'pending'
      });
      
      if (existingBooking) {
        existingBooking.stripeSessionId = session.id;
        await existingBooking.save();
        console.log('Updated existing booking with session ID:', existingBooking._id);
      }
    } catch (error) {
      console.error('Error updating existing booking:', error);
    }
    
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to create payment session',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Create Stripe Checkout Session for Tour Booking
router.post('/create-tour-session', async (req, res) => {
  const { tourId, userId, amount, name, phone, passengers, date, time, message } = req.body;
  
  try {
    console.log('Creating tour booking session with data:', {
      tourId, userId, amount, name, phone, passengers, date, time, message
    });

    // Validate required fields
    if (!tourId || !userId || !amount || !name || !phone || !passengers || !date || !time) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['tourId', 'userId', 'amount', 'name', 'phone', 'passengers', 'date', 'time']
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'pkr',
          product_data: {
            name: `Tour Booking: ${tourId}`,
            description: `Tour: ${tourId} | Date: ${date} | Time: ${time} | Passengers: ${passengers}${message ? ` | Message: ${message}` : ''}`,
          },
          unit_amount: Math.round(amount * 100), // amount in pkr, ensure it's an integer
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/customer?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/customer?payment=cancelled',
      metadata: { 
        tourId, 
        userId,
        name,
        phone,
        passengers: passengers.toString(),
        date,
        time,
        message: message || ''
      }
    });

    console.log('Stripe session created successfully:', session.id);
    
    // Try to find and update existing trip with session ID
    try {
      const existingTrip = await Trip.findOne({
        tourType: tourId,
        name: name,
        phone: phone,
        paymentStatus: 'pending'
      });
      
      if (existingTrip) {
        existingTrip.stripeSessionId = session.id;
        await existingTrip.save();
        console.log('Updated existing trip with session ID:', existingTrip._id);
      }
    } catch (error) {
      console.error('Error updating existing trip:', error);
    }
    
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to create payment session',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Simple webhook test endpoint
router.post('/webhook-test', (req, res) => {
  console.log('Webhook test received');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.json({ message: 'Webhook test received successfully' });
});

// Webhook to handle successful payments
router.post('/webhook', async (req, res) => {
  // For testing, skip signature verification temporarily
  // const sig = req.headers['stripe-signature'];
  // const endpointSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // TODO: Replace with your webhook secret

  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  // } catch (err) {
  //   console.error('Webhook signature verification failed:', err.message);
  //   return res.status(400).send(`Webhook Error: ${err.message}`);
  // }

  // For testing, parse the event directly
  let event;
  try {
    event = req.body; // req.body is already parsed as JSON
    console.log('Webhook received:', event);
  } catch (err) {
    console.error('Failed to parse webhook body:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Processing successful payment:', session.id);
    console.log('Session metadata:', session.metadata);
    console.log('Session amount:', session.amount_total);
    
    try {
      const { carId, tourId, userId, pickupLocation, dropLocation, date, time, passengers, customerName, customerPhone, name, phone, message } = session.metadata;
      
      console.log('Extracted metadata:', {
        carId, tourId, userId, pickupLocation, dropLocation, date, time, passengers, customerName, customerPhone, name, phone, message
      });
      
      // Handle demo user IDs - create real user if needed
      let realUser = null;
      if (userId && userId.startsWith('demo_user_')) {
        // Create a real user for demo bookings
        realUser = new User({
          username: 'demo_customer_' + Date.now(),
          email: 'demo@example.com',
          password: 'demo123',
          userType: 'customer',
          phone: customerPhone || phone || '03001234567'
        });
        await realUser.save();
        console.log('Created real user for demo booking:', realUser._id);
      } else {
        // Use existing user
        realUser = await User.findById(userId);
        if (!realUser) {
          console.error('User not found:', userId);
          return res.status(500).json({ error: 'User not found' });
        }
      }
      
      // Enhanced payment details
      const paymentDetails = {
        stripePaymentIntentId: session.payment_intent,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        currency: session.currency || 'pkr',
        paymentDate: new Date(),
        paymentStatus: 'completed'
      };
      
      // Create payment transaction record
      const paymentTransaction = new PaymentTransaction({
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        user: realUser._id,
        amount: session.amount_total / 100,
        currency: session.currency || 'pkr',
        paymentMethod: session.payment_method_types?.[0] || 'card',
        status: 'completed',
        completedAt: new Date(),
        metadata: {
          carId,
          tourId,
          pickupLocation,
          dropLocation,
          date,
          time,
          passengers,
          customerName,
          customerPhone,
          name,
          phone,
          message
        }
      });
      await paymentTransaction.save();
      console.log('Payment transaction saved:', paymentTransaction._id);
      
      if (carId) {
        console.log('Processing car booking for:', carId);
        
        // First, try to find existing booking with pending payment
        let existingBooking = await Booking.findOne({
          carName: carId,
          customerName: customerName,
          customerPhone: customerPhone,
          paymentStatus: 'pending'
        });
        
        if (existingBooking) {
          console.log('Found existing booking to update:', existingBooking._id);
          
          // Update existing booking
          existingBooking.paymentStatus = 'paid';
          existingBooking.status = 'confirmed';
          existingBooking.stripeSessionId = session.id;
          existingBooking.paymentDetails = paymentDetails;
          existingBooking.confirmedAt = new Date();
          await existingBooking.save();
          
          // Update payment transaction with booking reference
          paymentTransaction.booking = existingBooking._id;
          await paymentTransaction.save();
          
          console.log('Existing car booking updated successfully');
        } else {
          console.log('No existing booking found, creating new one');
          
          // Create new booking if none exists
          const booking = new Booking({
            user: realUser._id,
            carName: carId,
            pickupLocation,
            dropLocation,
            date: new Date(date),
            time,
            passengers: parseInt(passengers),
            totalAmount: session.amount_total / 100, // Convert from cents
            paymentStatus: 'paid',
            stripeSessionId: session.id,
            customerName,
            customerPhone,
            paymentDetails,
            status: 'confirmed', // Auto-confirm after payment
            confirmedAt: new Date()
          });
          await booking.save();
          console.log('New car booking saved:', booking._id);

          // Update payment transaction with booking reference
          paymentTransaction.booking = booking._id;
          await paymentTransaction.save();

          console.log('New car booking created successfully');
        }
      } else if (tourId) {
        console.log('Processing tour booking for:', tourId);
        
        // First, try to find existing trip with pending payment
        let existingTrip = await Trip.findOne({
          tourType: tourId,
          name: name,
          phone: phone,
          paymentStatus: 'pending'
        });
        
        if (existingTrip) {
          console.log('Found existing trip to update:', existingTrip._id);
          
          // Update existing trip
          existingTrip.paymentStatus = 'paid';
          existingTrip.status = 'confirmed';
          existingTrip.stripeSessionId = session.id;
          existingTrip.paymentDetails = paymentDetails;
          existingTrip.confirmedAt = new Date();
          await existingTrip.save();
          
          // Update payment transaction with trip reference
          paymentTransaction.trip = existingTrip._id;
          await paymentTransaction.save();
          
          console.log('Existing tour booking updated successfully');
        } else {
          console.log('No existing trip found, creating new one');
          
          // Create new trip if none exists
          const trip = new Trip({
            user: realUser._id,
            tourType: tourId,
            name,
            phone,
            passengers: parseInt(passengers),
            date: new Date(date),
            time,
            message,
            totalAmount: session.amount_total / 100,
            paymentStatus: 'paid',
            stripeSessionId: session.id,
            paymentDetails,
            status: 'confirmed', // Auto-confirm after payment
            confirmedAt: new Date()
          });
          await trip.save();
          console.log('New tour booking saved:', trip._id);

          // Update payment transaction with trip reference
          paymentTransaction.trip = trip._id;
          await paymentTransaction.save();

          console.log('New tour booking created successfully');
        }
      } else {
        console.error('No carId or tourId found in metadata');
      }
    } catch (error) {
      console.error('Error processing payment webhook:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  res.json({ received: true });
});



// Get payment status for a booking
router.get('/payment-status/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { type } = req.query; // 'booking' or 'trip'
    
    let record;
    if (type === 'trip') {
      record = await Trip.findById(bookingId);
    } else {
      record = await Booking.findById(bookingId);
    }
    
    if (!record) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      paymentStatus: record.paymentStatus,
      paymentDetails: record.paymentDetails,
      totalAmount: record.totalAmount,
      stripeSessionId: record.stripeSessionId
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Get user's payment transaction history
router.get('/user-transactions', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const transactions = await PaymentTransaction.find({ user: userId })
      .populate('booking')
      .populate('trip')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// Get all payment transactions (admin only)
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    
    const transactions = await PaymentTransaction.find(query)
      .populate('user', 'username email')
      .populate('booking')
      .populate('trip')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PaymentTransaction.countDocuments(query);
    
    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await PaymentTransaction.findById(transactionId)
      .populate('user', 'username email')
      .populate('booking')
      .populate('trip');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Process refund for a booking
router.post('/refund/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { type, reason, amount } = req.body; // type: 'booking' or 'trip'
    
    let record;
    if (type === 'trip') {
      record = await Trip.findById(bookingId);
    } else {
      record = await Booking.findById(bookingId);
    }
    
    if (!record) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (record.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Booking is not paid' });
    }
    
    // Process refund through Stripe
    const refundAmount = amount || record.totalAmount;
    const refund = await stripe.refunds.create({
      payment_intent: record.paymentDetails.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: reason || 'requested_by_customer'
    });
    
    // Update booking record
    record.paymentStatus = 'refunded';
    record.paymentDetails.refundAmount = refundAmount;
    record.paymentDetails.refundDate = new Date();
    record.paymentDetails.refundReason = reason;
    record.status = 'canceled';
    record.canceledAt = new Date();
    
    await record.save();
    
    res.json({
      message: 'Refund processed successfully',
      refundId: refund.id,
      refundAmount: refundAmount,
      booking: record
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Verify payment and update booking status
router.post('/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('🔍 Verifying payment for session:', sessionId);
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📋 Stripe session payment status:', session.payment_status);
    
    if (session.payment_status === 'paid') {
      // Find booking by session ID
      let booking = await Booking.findOne({ stripeSessionId: sessionId });
      let trip = await Trip.findOne({ stripeSessionId: sessionId });
      
      console.log('🔍 Looking for booking with session ID:', sessionId);
      console.log('📋 Found booking:', booking ? booking._id : 'Not found');
      console.log('📋 Found trip:', trip ? trip._id : 'Not found');
      
      if (booking) {
        console.log('✅ Updating booking payment status');
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.confirmedAt = new Date();
        await booking.save();
        
        console.log('✅ Booking updated successfully');
        res.json({
          success: true,
          message: 'Payment verified successfully',
          booking: booking
        });
      } else if (trip) {
        console.log('✅ Updating trip payment status');
        trip.paymentStatus = 'paid';
        trip.status = 'confirmed';
        trip.confirmedAt = new Date();
        await trip.save();
        
        console.log('✅ Trip updated successfully');
        res.json({
          success: true,
          message: 'Payment verified successfully',
          trip: trip
        });
      } else {
        console.log('❌ No booking or trip found with session ID:', sessionId);
        
        // Try to find any pending bookings that might match
        const pendingBookings = await Booking.find({ paymentStatus: 'pending' });
        const pendingTrips = await Trip.find({ paymentStatus: 'pending' });
        
        console.log('📋 Pending bookings count:', pendingBookings.length);
        console.log('📋 Pending trips count:', pendingTrips.length);
        
        res.status(404).json({ 
          success: false,
          error: 'Booking not found for this session',
          debug: {
            sessionId,
            pendingBookingsCount: pendingBookings.length,
            pendingTripsCount: pendingTrips.length
          }
        });
      }
    } else {
      console.log('❌ Payment not completed, status:', session.payment_status);
      res.status(400).json({ 
        success: false,
        error: 'Payment not completed',
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify payment',
      details: error.message
    });
  }
});

// Get booking statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const paidBookings = await Booking.countDocuments({ paymentStatus: 'paid' });
    const paidTrips = await Trip.countDocuments({ paymentStatus: 'paid' });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalTripRevenue = await Trip.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalBookings,
      totalTrips,
      paidBookings,
      paidTrips,
      totalRevenue: (totalRevenue[0]?.total || 0) + (totalTripRevenue[0]?.total || 0),
      successRate: totalBookings + totalTrips > 0 ? 
        ((paidBookings + paidTrips) / (totalBookings + totalTrips) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 