const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TourPackage = require('../models/TourPackage');
const bcrypt = require('bcrypt');

// Create a test user
router.post('/create-test-user', async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      return res.json({
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          password: 'test123'
        }
      });
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });

    await user.save();
    console.log('Test user created:', user._id);

    res.status(201).json({
      message: 'Test user created successfully',
      user: {
        email: user.email,
        password: 'test123'
      }
    });
  } catch (err) {
    console.error('Error creating test user:', err);
    res.status(500).json({
      message: 'Error creating test user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Create a sample tour package
router.post('/create-sample-package', async (req, res) => {
  try {
    // Create or get test vendor
    let vendor = await User.findOne({ email: 'vendor@example.com' });
    if (!vendor) {
      const hashedPassword = await bcrypt.hash('vendor123', 10);
      vendor = new User({
        name: 'Test Vendor',
        email: 'vendor@example.com',
        password: hashedPassword,
        role: 'vendor'
      });
      await vendor.save();
      console.log('Test vendor created:', vendor._id);
    }

    // Create a sample package
    const package = new TourPackage({
      title: "Goa Beach Escape",
      description: "A fun-filled 3-day trip to Goa's pristine beaches.",
      destination: "Goa",
      price: 9999,
      duration: "3 days",
      images: ["goa.jpg"],
      available: true,
      vendor: vendor._id
    });

    await package.save();
    console.log('Sample package created:', package._id);

    res.status(201).json({
      message: 'Sample package created successfully',
      package: {
        id: package._id,
        title: package.title,
        price: package.price
      }
    });
  } catch (err) {
    console.error('Error creating sample package:', err);
    res.status(500).json({
      message: 'Error creating sample package',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Create a test vendor and sample packages
router.post('/setup-test-data', async (req, res) => {
  try {
    // Create test vendor
    const hashedPassword = await bcrypt.hash('vendor123', 10);
    const vendor = new User({
      name: 'Test Vendor',
      email: 'vendor@example.com',
      password: hashedPassword,
      role: 'vendor'
    });
    await vendor.save();
    console.log('Test vendor created:', vendor._id);

    // Create sample packages
    const packages = [
      {
        title: "Goa Beach Escape",
        description: "A fun-filled 3-day trip to Goa's pristine beaches.",
        destination: "Goa",
        price: 9999,
        duration: "3 days",
        images: ["goa.jpg"],
        available: true,
        vendor: vendor._id
      },
      {
        title: "Manali Snow Adventure",
        description: "Explore the snowy mountains and enjoy winter sports in Manali.",
        destination: "Manali",
        price: 11999,
        duration: "4 days",
        images: ["manali.jpg"],
        available: true,
        vendor: vendor._id
      }
    ];

    const savedPackages = await TourPackage.insertMany(packages);
    console.log('Sample packages created:', savedPackages.length);

    res.status(201).json({
      message: 'Test data created successfully',
      data: {
        vendor: {
          email: vendor.email,
          password: 'vendor123'
        },
        packages: savedPackages.map(p => ({
          id: p._id,
          title: p.title,
          price: p.price
        }))
      }
    });
  } catch (err) {
    console.error('Error creating test data:', err);
    res.status(500).json({
      message: 'Error creating test data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 