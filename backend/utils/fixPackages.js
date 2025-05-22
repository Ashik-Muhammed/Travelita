const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB for package fixes');
  // Run the fix after successful connection
  fixPackages();
})
.catch(err => console.error('MongoDB connection error:', err));

// Load the TourPackage model
const TourPackage = require('../models/TourPackage');

async function fixPackages() {
  try {
    console.log('Starting package fix script...');
    
    // Find packages with vendor field instead of vendorId using mongoose model
    // First get the collection name from the model
    const collectionName = TourPackage.collection.collectionName;
    console.log(`Using collection: ${collectionName}`);
    
    // Query for documents with vendor field but no vendorId
    const packagesWithVendor = await mongoose.connection.db.collection(collectionName).find({
      vendor: { $exists: true }
    }).toArray();
    
    console.log(`Found ${packagesWithVendor.length} packages with 'vendor' field that need fixing`);
    
    // Process each package
    for (const pkg of packagesWithVendor) {
      console.log(`Processing package: ${pkg._id} - ${pkg.title || 'untitled'}`);
      
      try {
        // Update the package to use vendorId instead of vendor
        await mongoose.connection.db.collection(collectionName).updateOne(
          { _id: pkg._id },
          { 
            $set: { vendorId: pkg.vendor }, 
            $unset: { vendor: "" }
          }
        );
        console.log(`Fixed package: ${pkg._id}`);
      } catch (updateErr) {
        console.error(`Error fixing package ${pkg._id}:`, updateErr);
      }
    }
    
    // Check for packages with invalid or missing vendorId
    const packagesWithoutVendorId = await TourPackage.find({
      $or: [
        { vendorId: { $exists: false } },
        { vendorId: null }
      ]
    });
    
    console.log(`Found ${packagesWithoutVendorId.length} packages with missing vendorId`);
    
    // Set a default admin ID for packages missing vendorId
    if (packagesWithoutVendorId.length > 0) {
      // Find an admin user to use as default
      const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
      
      if (adminUser) {
        console.log(`Using admin user ${adminUser._id} as default vendorId`);
        
        for (const pkg of packagesWithoutVendorId) {
          await TourPackage.updateOne(
            { _id: pkg._id },
            { $set: { vendorId: adminUser._id } }
          );
          console.log(`Set vendorId for package ${pkg._id}`);
        }
      } else {
        console.log('No admin user found, using first vendor instead');
        const vendor = await mongoose.connection.db.collection('users').findOne({ role: 'vendor' });
        
        if (vendor) {
          for (const pkg of packagesWithoutVendorId) {
            await TourPackage.updateOne(
              { _id: pkg._id },
              { $set: { vendorId: vendor._id } }
            );
            console.log(`Set vendorId for package ${pkg._id} to vendor ${vendor._id}`);
          }
        } else {
          console.error('No vendors found either, cannot fix packages');
        }
      }
    }
    
    console.log('Package fix completed!');
  } catch (err) {
    console.error('Error fixing packages:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 