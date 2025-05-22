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
  fixAllPackages();
})
.catch(err => console.error('MongoDB connection error:', err));

async function fixAllPackages() {
  try {
    console.log('Starting comprehensive package fix script...');
    
    // Get collection directly
    const collection = mongoose.connection.collection('tourpackages');
    
    // Find all packages
    const allPackages = await collection.find({}).toArray();
    console.log(`Found ${allPackages.length} total packages`);
    
    let fixedCount = 0;
    
    // Process each package
    for (const pkg of allPackages) {
      console.log(`\nChecking package: ${pkg._id} - ${pkg.title || 'untitled'}`);
      
      const updates = {};
      const unsetFields = {};
      let requiresUpdate = false;
      
      // Check vendorId (critical field)
      if (!pkg.vendorId) {
        console.log('- Missing vendorId');
        requiresUpdate = true;
      } else if (typeof pkg.vendorId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(pkg.vendorId)) {
          console.log('- Invalid string vendorId:', pkg.vendorId);
          requiresUpdate = true;
        }
      } else if (typeof pkg.vendorId === 'object') {
        console.log('- vendorId is an object instead of ObjectId');
        requiresUpdate = true;
      }
      
      // Check for vendor field (should use vendorId)
      if (pkg.vendor) {
        console.log('- Has vendor field instead of vendorId');
        if (mongoose.Types.ObjectId.isValid(pkg.vendor)) {
          updates.vendorId = new mongoose.Types.ObjectId(pkg.vendor);
        }
        unsetFields.vendor = "";
        requiresUpdate = true;
      }
      
      // Check required fields
      const requiredFields = [
        { field: 'title', defaultValue: 'Untitled Package' },
        { field: 'description', defaultValue: 'No description available' },
        { field: 'destination', defaultValue: 'Unknown destination' },
        { field: 'duration', defaultValue: '1 day' },
        { field: 'price', defaultValue: 0 }
      ];
      
      for (const { field, defaultValue } of requiredFields) {
        if (pkg[field] === undefined || pkg[field] === null) {
          console.log(`- Missing required field: ${field}`);
          updates[field] = defaultValue;
          requiresUpdate = true;
        }
      }
      
      // Set default status if missing
      if (!pkg.status || !['pending', 'approved', 'rejected'].includes(pkg.status)) {
        console.log('- Invalid status');
        updates.status = 'pending';
        requiresUpdate = true;
      }
      
      // Add views field if missing
      if (pkg.views === undefined) {
        console.log('- Missing views field');
        updates.views = 0;
        requiresUpdate = true;
      }
      
      // If vendorId is invalid, find a valid admin or vendor
      if (requiresUpdate && (!pkg.vendorId || typeof pkg.vendorId === 'object' || 
          (typeof pkg.vendorId === 'string' && !mongoose.Types.ObjectId.isValid(pkg.vendorId)))) {
        
        // First try to find an admin
        const adminUser = await mongoose.connection.collection('users').findOne({ role: 'admin' });
        
        if (adminUser) {
          updates.vendorId = adminUser._id;
          console.log(`- Setting vendorId to admin: ${adminUser._id}`);
        } else {
          // Then try to find a vendor
          const vendor = await mongoose.connection.collection('users').findOne({ role: 'vendor' });
          
          if (vendor) {
            updates.vendorId = vendor._id;
            console.log(`- Setting vendorId to vendor: ${vendor._id}`);
          } else {
            // Use any user as a last resort
            const anyUser = await mongoose.connection.collection('users').findOne({});
            
            if (anyUser) {
              updates.vendorId = anyUser._id;
              console.log(`- Setting vendorId to user: ${anyUser._id}`);
            } else {
              console.log('! No users found in database to set as vendorId');
            }
          }
        }
      }
      
      // Apply updates if needed
      if (requiresUpdate) {
        const updateOps = {};
        if (Object.keys(updates).length > 0) {
          updateOps.$set = updates;
        }
        if (Object.keys(unsetFields).length > 0) {
          updateOps.$unset = unsetFields;
        }
        
        try {
          const result = await collection.updateOne(
            { _id: pkg._id },
            updateOps
          );
          
          console.log(`- Package updated: modified=${result.modifiedCount}`);
          fixedCount++;
        } catch (updateErr) {
          console.error(`! Error updating package ${pkg._id}:`, updateErr.message);
        }
      } else {
        console.log('- No issues found with this package');
      }
    }
    
    console.log(`\nFinished checking all packages. Fixed ${fixedCount} out of ${allPackages.length}`);
    
  } catch (err) {
    console.error('Error fixing packages:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 