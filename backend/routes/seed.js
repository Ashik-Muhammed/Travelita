const mongoose = require('mongoose');
const router = require('express').Router();
const Package = require('../models/TourPackage');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Create a test user
const createTestUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });
    await user.save();
    console.log('Test user created:', user._id);
    return user._id;
  } catch (err) {
    console.error('Error creating test user:', err);
    throw err;
  }
};

// Create a test vendor
const createTestVendor = async () => {
  try {
    const hashedPassword = await bcrypt.hash('vendor123', 10);
    const vendor = new User({
      name: 'Test Vendor',
      email: 'vendor@example.com',
      password: hashedPassword,
      role: 'vendor'
    });
    await vendor.save();
    console.log('Test vendor created:', vendor._id);
    return vendor._id;
  } catch (err) {
    console.error('Error creating test vendor:', err);
    throw err;
  }
};

// Sample tour packages
const createSamplePackages = async (vendorId) => {
  const samplePackages = [
    {
      vendorId: vendorId,
      title: "Goa Beach Escape",
      description: "A fun-filled 3-day trip to Goa's pristine beaches.",
      destination: "Goa",
      price: 9999,
      duration: "3 days",
      images: ["goa.jpg"]
    },
    {
      vendorId: vendorId,
      title: "Manali Snow Adventure",
      description: "Explore the snowy mountains and enjoy winter sports in Manali.",
      destination: "Manali",
      price: 11999,
      duration: "4 days",
      images: ["manali.jpg"]
    },
    {
      vendorId: vendorId,
      title: "Jaipur Heritage Tour",
      description: "A royal experience visiting palaces and forts in Jaipur.",
      destination: "Jaipur",
      price: 7499,
      duration: "2 days",
      images: ["jaipur.jpg"]
    }
  ];

  try {
    await Package.deleteMany(); // Clear existing packages
    const packages = await Package.insertMany(samplePackages);
    console.log('Sample packages created:', packages.length);
    return packages;
  } catch (err) {
    console.error('Error creating sample packages:', err);
    throw err;
  }
};

// Seed all data
router.get('/seed-all', async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Package.deleteMany({});

    // Create test users
    const userId = await createTestUser();
    const vendorId = await createTestVendor();

    // Create sample packages
    const packages = await createSamplePackages(vendorId);

    res.json({
      message: 'Database seeded successfully',
      data: {
        user: { id: userId, email: 'test@example.com', password: 'test123' },
        vendor: { id: vendorId, email: 'vendor@example.com', password: 'vendor123' },
        packages: packages.length
      }
    });
  } catch (err) {
    console.error('Error seeding database:', err);
    res.status(500).json({
      message: 'Error seeding database',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
