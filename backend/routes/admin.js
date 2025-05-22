const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const User = require('../models/User');
const TourPackage = require('../models/TourPackage');
const Booking = require('../models/booking');
const mongoose = require('mongoose');
const adminAuthController = require('../controllers/adminAuthController');

// Admin login route (public)
router.post('/login', adminAuthController.login);

// Admin auth check middleware
const adminCheck = [auth, roleMiddleware(['admin'])];

// Get admin profile (protected)
router.get('/profile', adminCheck, adminAuthController.getProfile);

// Get admin dashboard stats
router.get('/stats', adminCheck, async (req, res) => {
  try {
    console.log('Admin stats request received - user ID:', req.user.id);
    console.log('Admin stats request received - user role:', req.user.role);
    
    // Verify models exist
    if (!User || !TourPackage || !Booking) {
      console.error('Error: One or more models not defined properly');
      return res.status(500).json({ 
        message: 'Server configuration error',
        error: 'Database models not properly initialized'
      });
    }
    
    // Get user stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    
    console.log('User stats calculated:', { totalUsers, totalVendors });
    
    // Get package stats - default to 0 if no packages with that status
    const totalPackages = await TourPackage.countDocuments({ status: 'approved' }) || 0;
    const pendingApprovals = await TourPackage.countDocuments({ status: 'pending' }) || 0;
    
    console.log('Package stats calculated:', { totalPackages, pendingApprovals });
    
    // Get booking stats
    const totalBookings = await Booking.countDocuments() || 0;
    
    console.log('Booking stats calculated:', { totalBookings });
    
    // Get recent packages without populate for now
    const recentPackages = await TourPackage.find()
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('Recent packages retrieved:', recentPackages.length);

    // Return simplistic stats for now, avoid any schema mismatch issues
    res.json({
      totalUsers,
      totalVendors,
      totalPackages,
      pendingApprovals,
      totalBookings,
      recentPackages
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to fetch admin statistics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get pending packages
router.get('/packages/pending', adminCheck, async (req, res) => {
  try {
    const pendingPackages = await TourPackage.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json(pendingPackages);
  } catch (err) {
    console.error('Error fetching pending packages:', err);
    res.status(500).json({ 
      message: 'Failed to fetch pending packages',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Approve or reject a package
router.put('/packages/:id/:action', adminCheck, async (req, res) => {
  try {
    const { id, action } = req.params;
    
    console.log(`Admin ${action} request for package: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid package ID format');
      return res.status(400).json({ message: 'Invalid package ID' });
    }
    
    if (!['approve', 'reject'].includes(action)) {
      console.log('Invalid action requested:', action);
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }
    
    // Use direct MongoDB update to bypass validation temporarily
    const collection = mongoose.connection.collection('tourpackages');
    
    // First, get the current package to check if it exists
    const package = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (!package) {
      console.log('Package not found with ID:', id);
      return res.status(404).json({ message: 'Package not found' });
    }
    
    console.log('Found package:', package._id);
    
    // Prepare the update
    const update = {
      $set: {
        status: action === 'approve' ? 'approved' : 'rejected',
        vendorId: package.vendorId || req.user.id // Ensure vendorId is set
      }
    };
    
    // Perform the update
    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      update
    );
    
    if (result.matchedCount === 0) {
      console.log('No package found with ID:', id);
      return res.status(404).json({ message: 'Package not found' });
    }
    
    console.log('Package updated successfully');
    
    // Return success response
    res.json({
      message: `Package ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      package: {
        _id: id,
        status: action === 'approve' ? 'approved' : 'rejected'
      }
    });
  } catch (err) {
    console.error(`Error ${req.params.action}ing package:`, err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: `Failed to ${req.params.action} package`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all users (for admin panel)
router.get('/users', adminCheck, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password');
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update user role
router.put('/users/:id/role', adminCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    if (!['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Use "user", "vendor", or "admin"' });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ 
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update user status (active/inactive)
router.put('/users/:id/status', adminCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'Active status must be a boolean' });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.active = active;
    await user.save();
    
    res.json({
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ 
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 