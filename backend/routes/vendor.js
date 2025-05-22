const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const TourPackage = require('../models/TourPackage');
const Booking = require('../models/booking');
const mongoose = require('mongoose');
const upload = require('../middleware/uploadMiddleware');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const TourBooking = require('../models/TourBooking');

// Vendor auth check middleware
const vendorCheck = [auth, roleMiddleware(['vendor', 'admin'])];

// Middleware to verify vendor token
const vendorAuth = async (req, res, next) => {
  try {
    console.log('vendorAuth middleware - Request headers:', {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'No Authorization header'
    });
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('vendorAuth middleware - No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('vendorAuth middleware - Token received, attempting to verify');
    const jwtSecret = process.env.JWT_SECRET || 'fallbacksecretkey';
    console.log('vendorAuth middleware - Using JWT_SECRET:', jwtSecret ? 'Secret is set' : 'No secret available');

    const decoded = jwt.verify(token, jwtSecret);
    console.log('vendorAuth middleware - Token verified, decoded payload:', {
      vendorId: decoded.vendorId,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration',
      iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'No issue time'
    });
    
    const vendor = await Vendor.findById(decoded.vendorId);

    if (!vendor) {
      console.log(`vendorAuth middleware - Vendor not found with ID: ${decoded.vendorId}`);
      return res.status(401).json({ message: 'Vendor not found' });
    }

    console.log(`vendorAuth middleware - Vendor found: ${vendor.name} (${vendor.email})`);
    req.token = token;
    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('vendorAuth middleware - Error:', error);
    console.error('vendorAuth middleware - Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ message: 'Authentication failed', details: error.message });
  }
};

// Get vendor dashboard stats
router.get('/stats', vendorCheck, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get vendor's packages
    const packages = await TourPackage.find({ vendor: vendorId });
    const packageIds = packages.map(pkg => pkg._id);
    
    // Calculate stats
    const totalPackages = packages.length;
    const activePackages = packages.filter(pkg => pkg.available && pkg.status === 'approved').length;
    
    // Get booking stats
    const bookings = await Booking.find({ tourPackage: { $in: packageIds } })
      .populate('tourPackage', 'title price')
      .populate('user', 'name email');
    
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
    
    // Calculate revenue
    const revenue = bookings.reduce((total, booking) => {
      return total + (booking.tourPackage?.price || 0);
    }, 0);
    
    // Get recent bookings
    const recentBookings = await Booking.find({ tourPackage: { $in: packageIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tourPackage', 'title price images')
      .populate('user', 'name email');

    res.json({
      totalPackages,
      activePackages,
      totalBookings,
      pendingBookings,
      revenue,
      recentBookings
    });
  } catch (err) {
    console.error('Error fetching vendor stats:', err);
    res.status(500).json({ 
      message: 'Failed to fetch vendor statistics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get vendor's packages
router.get('/packages', vendorAuth, async (req, res) => {
  try {
    const packages = await TourPackage.find({ vendorId: req.vendor._id });
    res.json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get packages', details: error.message });
  }
});

// Create a new package
router.post('/packages', vendorCheck, upload.array('images', 5), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Map uploaded images if any
    let images = [];
    if (req.files) {
      images = req.files.map(file => file.filename);
    }

    // Set expiry date if provided
    let expiryDate = null;
    if (req.body.expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(req.body.expiryDays));
    }

    const newPackage = new TourPackage({
      ...req.body,
      vendor: vendorId,
      images,
      expiryDate,
      // Default status: If admin, auto-approve, otherwise pending
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    await newPackage.save();
    
    res.status(201).json({
      message: 'Package created successfully',
      package: newPackage
    });
  } catch (err) {
    console.error('Create package error:', err);
    res.status(500).json({ 
      message: 'Failed to create package', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get a specific package
router.get('/packages/:id', vendorCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }
    
    const package = await TourPackage.findOne({ 
      _id: id,
      vendor: vendorId
    });
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found or not authorized' });
    }
    
    res.json(package);
  } catch (err) {
    console.error('Error fetching package:', err);
    res.status(500).json({ 
      message: 'Failed to fetch package',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update a package
router.put('/packages/:id', vendorCheck, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }
    
    const package = await TourPackage.findOne({ 
      _id: id,
      vendor: vendorId
    });
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found or not authorized' });
    }
    
    // Handle expiry date update
    if (req.body.expiryDays) {
      const expiryDays = parseInt(req.body.expiryDays);
      if (expiryDays > 0) {
        await package.setExpiryDate(expiryDays);
      }
      delete req.body.expiryDays;
    }
    
    // If vendor is updating significant fields, reset status to pending
    const significantFields = ['title', 'description', 'destination', 'price', 'duration'];
    const isSignificantUpdate = Object.keys(req.body)
      .some(field => significantFields.includes(field));
    
    if (isSignificantUpdate && req.user.role !== 'admin') {
      package.status = 'pending';
    }
    
    // Update allowed fields
    const updatableFields = [
      'title', 'description', 'destination', 'price', 'duration', 
      'available', 'featuredType'
    ];
    
    updatableFields.forEach(field => {
      if (field in req.body) {
        package[field] = req.body[field];
      }
    });
    
    // Update images if uploaded
    if (req.files && req.files.length > 0) {
      package.images = req.files.map(file => file.filename);
    }
    
    await package.save();
    
    res.json({
      message: 'Package updated successfully',
      package
    });
  } catch (err) {
    console.error('Error updating package:', err);
    res.status(500).json({ 
      message: 'Failed to update package',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Toggle package availability
router.put('/packages/:id/toggle-status', vendorCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }
    
    const package = await TourPackage.findOne({ 
      _id: id,
      vendor: vendorId
    });
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found or not authorized' });
    }
    
    // Can only toggle if approved
    if (package.status !== 'approved' && req.user.role !== 'admin') {
      return res.status(400).json({ 
        message: 'Cannot change availability for packages that are not approved' 
      });
    }
    
    package.available = !package.available;
    await package.save();
    
    res.json({
      message: `Package ${package.available ? 'activated' : 'deactivated'} successfully`,
      package
    });
  } catch (err) {
    console.error('Error toggling package status:', err);
    res.status(500).json({ 
      message: 'Failed to update package status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete a package
router.delete('/packages/:id', vendorCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }
    
    // Check for existing bookings
    const bookings = await Booking.countDocuments({ tourPackage: id });
    if (bookings > 0 && req.user.role !== 'admin') {
      return res.status(400).json({ 
        message: 'Cannot delete package with existing bookings' 
      });
    }
    
    const package = await TourPackage.findOneAndDelete({ 
      _id: id,
      vendor: vendorId
    });
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found or not authorized' });
    }
    
    res.json({
      message: 'Package deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting package:', err);
    res.status(500).json({ 
      message: 'Failed to delete package',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get vendor's bookings
router.get('/bookings', vendorAuth, async (req, res) => {
  try {
    // First get all packages by this vendor
    const packages = await TourPackage.find({ vendorId: req.vendor._id });
    const packageIds = packages.map(pkg => pkg._id);
    
    // Then find all bookings for these packages
    const bookings = await TourBooking.find({ packageId: { $in: packageIds } });
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get bookings', details: error.message });
  }
});

// Update booking status (confirm or cancel)
router.put('/bookings/:id/:action', vendorCheck, async (req, res) => {
  try {
    const { id, action } = req.params;
    const vendorId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    
    if (!['confirm', 'cancel'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "confirm" or "cancel"' });
    }
    
    const booking = await Booking.findById(id)
      .populate('tourPackage');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if vendor owns the package
    if (booking.tourPackage.vendor.toString() !== vendorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    booking.status = action === 'confirm' ? 'confirmed' : 'cancelled';
    await booking.save();
    
    // If this is the first booking for the package, increment the bookings count
    const package = await TourPackage.findById(booking.tourPackage._id);
    package.bookings += 1;
    await package.save();
    
    res.json({
      message: `Booking ${action === 'confirm' ? 'confirmed' : 'cancelled'} successfully`,
      booking
    });
  } catch (err) {
    console.error(`Error ${req.params.action}ing booking:`, err);
    res.status(500).json({ 
      message: `Failed to ${req.params.action} booking`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Register vendor
router.post('/register', async (req, res) => {
  try {
    console.log('Vendor registration attempt:', req.body);
    const { name, email, password, companyName, phone, address } = req.body;
    
    // Log received data
    console.log('Registration data received:', {
      name: name ? 'Provided' : 'Missing',
      email: email ? 'Provided' : 'Missing',
      password: password ? 'Provided (hidden)' : 'Missing',
      companyName: companyName ? 'Provided' : 'Missing',
      phone: phone ? 'Provided' : 'Missing',
      address: address ? 'Provided' : 'Missing'
    });

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      console.log('Registration failed: Email already exists');
      return res.status(400).json({ message: 'Vendor already exists with this email' });
    }

    // Create new vendor
    const vendor = new Vendor({
      name,
      email,
      password,
      companyName,
      phone,
      address
    });

    console.log('Saving vendor to database...');
    await vendor.save();
    console.log('Vendor saved successfully!');

    // Create token
    const token = jwt.sign(
      { vendorId: vendor._id },
      process.env.JWT_SECRET || 'fallbacksecretkey',
      { expiresIn: '7d' }
    );
    console.log('JWT token created for vendor');

    res.status(201).json({
      message: 'Vendor registered successfully',
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        companyName: vendor.companyName
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Registration failed', details: error.message });
  }
});

// Login vendor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { vendorId: vendor._id },
      process.env.JWT_SECRET || 'fallbacksecretkey',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        companyName: vendor.companyName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', details: error.message });
  }
});

// Get vendor profile
router.get('/profile', vendorAuth, async (req, res) => {
  try {
    res.json({
      vendor: {
        id: req.vendor._id,
        name: req.vendor.name,
        email: req.vendor.email,
        companyName: req.vendor.companyName,
        phone: req.vendor.phone,
        address: req.vendor.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', details: error.message });
  }
});

module.exports = router; 