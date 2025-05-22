require('dotenv').config();
const mongoose = require('mongoose');
const TourPackage = require('./models/TourPackage');

async function testPackageFetch() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages');
    console.log('Connected to MongoDB');

    // First test - direct database query
    console.log('TEST 1: Direct database fetch');
    try {
      const packageId = '682b489daf98264f4efa0508';
      console.log(`Fetching package with ID: ${packageId}`);
      
      const pkg = await TourPackage.findById(packageId);
      
      if (!pkg) {
        console.log('Package not found');
      } else {
        // Print the whole document
        console.log('Package found:', pkg);
        
        // Check if vendorId exists and is valid
        console.log('vendorId:', pkg.vendorId);
        console.log('vendorId type:', typeof pkg.vendorId);
        console.log('vendorId toString:', pkg.vendorId.toString());
        
        // Check for other fields
        console.log('Has views property:', pkg.hasOwnProperty('views'));
        console.log('Views value:', pkg.views);
      }
    } catch (err) {
      console.error('Error in TEST 1:', err);
    }
    
    // Second test - with populate
    console.log('\nTEST 2: Using populate');
    try {
      const packageId = '682b489daf98264f4efa0508';
      console.log(`Fetching package with ID and populate: ${packageId}`);
      
      const pkg = await TourPackage.findById(packageId)
        .populate('vendorId', 'name email');
        
      if (!pkg) {
        console.log('Package not found');
      } else {
        console.log('Package found with populated vendor:', pkg.vendorId);
      }
    } catch (err) {
      console.error('Error in TEST 2:', err);
    }
    
  } catch (err) {
    console.error('Main error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testPackageFetch(); 