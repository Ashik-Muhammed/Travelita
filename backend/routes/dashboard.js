const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/booking');
const TourPackage = require('../models/TourPackage');
const User = require('../models/User');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {
      totalBookings: 0,
      totalPackages: 0,
      totalRevenue: 0,
      recentBookings: []
    };

    // Get bookings based on user role
    let bookingsQuery = {};
    if (userRole === 'user') {
      bookingsQuery = { user: userId };
    } else if (userRole === 'vendor') {
      // Get packages by this vendor
      const vendorPackages = await TourPackage.find({ vendor: userId });
      const packageIds = vendorPackages.map(pkg => pkg._id);
      bookingsQuery = { tourPackage: { $in: packageIds } };
    }

    // Get total bookings
    stats.totalBookings = await Booking.countDocuments(bookingsQuery);

    // Get total packages
    if (userRole === 'vendor') {
      stats.totalPackages = await TourPackage.countDocuments({ vendor: userId });
    } else if (userRole === 'admin') {
      stats.totalPackages = await TourPackage.countDocuments();
    }

    // Get total revenue
    const bookings = await Booking.find(bookingsQuery)
      .populate('tourPackage', 'price')
      .sort({ createdAt: -1 })
      .limit(5);

    stats.totalRevenue = bookings.reduce((total, booking) => {
      return total + (booking.tourPackage?.price || 0);
    }, 0);

    // Get recent bookings with package details
    stats.recentBookings = await Booking.find(bookingsQuery)
      .populate('tourPackage', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({
      message: 'Error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 