const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Test route for debugging
router.get('/test', (req, res) => {
  console.log('Direct bookings test route hit!');
  res.json({ message: 'Direct bookings test route working!' });
});

// Simple schema for direct bookings
const tourBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  customerName: String,
  customerEmail: String,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create model using the schema
const TourBooking = mongoose.model('TourBooking', tourBookingSchema, 'tour_bookings');

// @route   POST /api/direct-bookings
// @desc    Create a booking directly in MongoDB without complex validation
// @access  Public (for testing purposes)
router.post('/', async (req, res) => {
  try {
    // Log the incoming request
    console.log('--- [DIRECT-BOOKING] Request received ---');
    console.log('--- [DIRECT-BOOKING] Request body:', req.body);
    
    // Validate essential fields
    const { userId, packageId } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'Both userId and packageId are required'
      });
    }

    // Create a new booking directly
    const newBooking = new TourBooking({
      userId: userId,
      packageId: packageId,
      status: req.body.status || 'confirmed',
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      price: req.body.price
    });

    // Save to MongoDB
    console.log('--- [DIRECT-BOOKING] Saving booking to MongoDB ---');
    const savedBooking = await newBooking.save();
    console.log('--- [DIRECT-BOOKING] Booking saved successfully ---');
    
    // Return success response with the created booking
    return res.status(201).json({
      message: 'Booking created successfully!',
      booking: savedBooking
    });
  } catch (err) {
    // Log any errors
    console.error('--- [DIRECT-BOOKING] Error:', {
      error: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return res.status(500).json({
        message: 'Database error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      message: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
  }
});

// @route   GET /api/direct-bookings
// @desc    Get all bookings
// @access  Public (for testing purposes)
router.get('/', async (req, res) => {
  try {
    console.log('--- [DIRECT-BOOKING] GET / route hit ---');
    const bookings = await TourBooking.find({});
    return res.json(bookings);
  } catch (err) {
    console.error('--- [DIRECT-BOOKING] Error fetching bookings:', err);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// @route   GET /api/direct-bookings/:userId
// @desc    Get bookings by user ID
// @access  Public (for testing purposes)
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await TourBooking.find({ userId: req.params.userId });
    return res.json(bookings);
  } catch (err) {
    console.error('--- [DIRECT-BOOKING] Error fetching user bookings:', err);
    return res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

module.exports = router; 