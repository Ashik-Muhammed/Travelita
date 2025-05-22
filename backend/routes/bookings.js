// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking'); // adjust path as needed
const TourPackage = require('../models/TourPackage');
const authMiddleware = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// Test route (from previous attempt, can be useful)
router.get('/test', (req, res) => {
  console.log('--- [ROUTES] Booking /test route hit! ---');
  return res.status(200).json({ message: 'Booking test route is working from routes file!' });
});

// @route   POST /
// @desc    Create a new booking
// @access  Private (requires authentication)
// Base path /api/bookings is handled by server.js where this router is mounted
router.post('/', authMiddleware, bookingController.createBooking);

// @route   GET /
// @desc    Get user's bookings
// @access  Private (requires authentication)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('tourPackage', 'title images price')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// We can add GET / for getUserBookings later
// router.get('/', authMiddleware, bookingController.getUserBookings);

module.exports = router;
