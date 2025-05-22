const mongoose = require('mongoose');
require('dotenv').config();

// The problematic package ID
const packageId = '682b489daf98264f4efa0508';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB for package diagnosis');
  // Run the diagnose after successful connection
  diagnosePackage();
})
.catch(err => console.error('MongoDB connection error:', err));

// Load the TourPackage model
const TourPackage = require('../models/TourPackage');

async function diagnosePackage() {
  try {
    console.log(`Diagnosing package with ID: ${packageId}`);
    
    // Check if package exists using raw MongoDB driver (avoid mongoose validation)
    const collection = TourPackage.collection;
    const rawPackage = await collection.findOne({ _id: new mongoose.Types.ObjectId(packageId) });
    
    if (!rawPackage) {
      console.log('Package not found in database!');
      return;
    }
    
    console.log('Raw package data from MongoDB:');
    console.log(JSON.stringify(rawPackage, null, 2));
    
    // Check for critical issues
    const issues = [];
    
    // 1. Check vendorId
    if (!rawPackage.vendorId) {
      issues.push('Missing vendorId');
    } else if (typeof rawPackage.vendorId === 'string') {
      // Check if string is valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(rawPackage.vendorId)) {
        issues.push('vendorId is not a valid ObjectId string');
      }
    } else if (typeof rawPackage.vendorId === 'object') {
      issues.push('vendorId is an object instead of ObjectId reference');
    }
    
    // 2. Check for vendor field (should be migrated to vendorId)
    if (rawPackage.vendor) {
      issues.push('Package has vendor field instead of vendorId');
    }
    
    // 3. Check required fields according to the schema
    for (const field of ['title', 'description', 'destination', 'duration', 'price']) {
      if (rawPackage[field] === undefined) {
        issues.push(`Missing required field: ${field}`);
      }
    }
    
    // Print issues summary
    if (issues.length > 0) {
      console.log('\nIssues found:');
      issues.forEach(issue => console.log(`- ${issue}`));
      
      console.log('\nAttempting to fix issues...');
      
      // Try to find a valid vendor/admin to assign to this package
      let validUserId = null;
      
      // Look for an admin
      const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
      if (adminUser) {
        validUserId = adminUser._id;
        console.log(`Found admin user with ID: ${validUserId}`);
      } else {
        // Look for any vendor
        const vendor = await mongoose.connection.db.collection('users').findOne({ role: 'vendor' });
        if (vendor) {
          validUserId = vendor._id;
          console.log(`Found vendor with ID: ${validUserId}`);
        } else {
          // Use the first user found
          const anyUser = await mongoose.connection.db.collection('users').findOne({});
          if (anyUser) {
            validUserId = anyUser._id;
            console.log(`Using any user with ID: ${validUserId}`);
          }
        }
      }
      
      // Update the package with fixes
      const updateData = {};
      
      // Fix vendorId if needed
      if (!rawPackage.vendorId || !mongoose.Types.ObjectId.isValid(rawPackage.vendorId)) {
        if (validUserId) {
          updateData.vendorId = validUserId;
        }
      }
      
      // Fix required fields with default values if missing
      if (!rawPackage.title) updateData.title = "Untitled Package";
      if (!rawPackage.description) updateData.description = "No description provided";
      if (!rawPackage.destination) updateData.destination = "Unknown";
      if (!rawPackage.duration) updateData.duration = "1 day";
      if (!rawPackage.price) updateData.price = 0;
      
      // Set default values for other fields
      if (!rawPackage.status) updateData.status = "pending";
      if (rawPackage.available === undefined) updateData.available = true;
      
      // Remove vendor field if it exists
      const unset = rawPackage.vendor ? { vendor: "" } : {};
      
      // Update the package
      if (Object.keys(updateData).length > 0 || Object.keys(unset).length > 0) {
        const updateOps = {};
        if (Object.keys(updateData).length > 0) updateOps.$set = updateData;
        if (Object.keys(unset).length > 0) updateOps.$unset = unset;
        
        const result = await collection.updateOne(
          { _id: new mongoose.Types.ObjectId(packageId) },
          updateOps
        );
        
        console.log(`Update result: ${result.modifiedCount} document modified`);
        
        // Fetch updated package
        const updatedPackage = await collection.findOne({ _id: new mongoose.Types.ObjectId(packageId) });
        console.log('\nUpdated package:');
        console.log(JSON.stringify(updatedPackage, null, 2));
      } else {
        console.log('No updates needed for the package.');
      }
    } else {
      console.log('No issues found with package structure!');
    }
    
    // Try manually updating status as a test
    console.log('\nTesting status update directly via MongoDB...');
    const statusResult = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(packageId) },
      { $set: { status: 'approved' } }
    );
    console.log(`Status update result: ${statusResult.modifiedCount} document modified`);
    
    // Final verification
    const finalPackage = await collection.findOne({ _id: new mongoose.Types.ObjectId(packageId) });
    console.log('\nFinal package state:');
    console.log(JSON.stringify(finalPackage, null, 2));
    
    console.log('\nDiagnosis completed!');
  } catch (err) {
    console.error('Error during package diagnosis:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 