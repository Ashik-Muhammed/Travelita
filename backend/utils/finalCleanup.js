const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB for final cleanup');
  // Run the cleanup after successful connection
  finalCleanup();
})
.catch(err => console.error('MongoDB connection error:', err));

async function finalCleanup() {
  try {
    console.log('Starting final database cleanup...');
    
    // Get collections
    const packagesCollection = mongoose.connection.collection('tourpackages');
    const usersCollection = mongoose.connection.collection('users');
    
    // Find all packages
    const allPackages = await packagesCollection.find({}).toArray();
    console.log(`Found ${allPackages.length} total packages to check`);
    
    // Check if we have any valid users to use as fallback
    const adminUser = await usersCollection.findOne({ role: 'admin' });
    const vendorUser = await usersCollection.findOne({ role: 'vendor' });
    const anyUser = await usersCollection.findOne({});
    
    let defaultUserId = null;
    if (adminUser) {
      defaultUserId = adminUser._id;
      console.log(`Will use admin user ${defaultUserId} as fallback if needed`);
    } else if (vendorUser) {
      defaultUserId = vendorUser._id;
      console.log(`Will use vendor user ${defaultUserId} as fallback if needed`);
    } else if (anyUser) {
      defaultUserId = anyUser._id;
      console.log(`Will use any user ${defaultUserId} as fallback if needed`);
    } else {
      console.log('Warning: No users found in database for fallback references');
    }
    
    let fixedCount = 0;
    
    // Process each package
    for (let i = 0; i < allPackages.length; i++) {
      const pkg = allPackages[i];
      console.log(`\n[${i+1}/${allPackages.length}] Checking package: ${pkg._id}`);
      
      const updates = {};
      const unsetFields = {};
      let requiresUpdate = false;
      
      // Examine and fix vendor/vendorId issues
      if (pkg.vendor && !pkg.vendorId) {
        console.log('- Has vendor but no vendorId - will migrate vendor to vendorId');
        updates.vendorId = pkg.vendor;
        unsetFields.vendor = "";
        requiresUpdate = true;
      }
      else if (pkg.vendor && pkg.vendorId) {
        console.log('- Has both vendor and vendorId - will remove vendor field');
        unsetFields.vendor = "";
        requiresUpdate = true;
      }
      else if (!pkg.vendor && !pkg.vendorId && defaultUserId) {
        console.log('- Missing both vendor and vendorId - adding default vendorId');
        updates.vendorId = defaultUserId;
        requiresUpdate = true;
      }
      
      // Ensure vendorId is a proper ObjectID if it exists
      if (pkg.vendorId) {
        if (typeof pkg.vendorId === 'object') {
          // Already an ObjectId-like object, no action needed
          console.log('- vendorId is already an object');
        } else if (typeof pkg.vendorId === 'string') {
          if (mongoose.Types.ObjectId.isValid(pkg.vendorId)) {
            console.log('- Converting string vendorId to ObjectId');
            updates.vendorId = new mongoose.Types.ObjectId(pkg.vendorId);
            requiresUpdate = true;
          } else {
            console.log('- Invalid string vendorId, replacing with default');
            if (defaultUserId) {
              updates.vendorId = defaultUserId;
              requiresUpdate = true;
            }
          }
        } else {
          console.log('- vendorId is invalid type, replacing with default');
          if (defaultUserId) {
            updates.vendorId = defaultUserId;
            requiresUpdate = true;
          }
        }
      }
      
      // Ensure package has all required fields
      const requiredFields = {
        title: 'Untitled Package',
        description: 'No description provided',
        destination: 'Unknown destination',
        duration: '1 day',
        price: 0,
        status: 'pending',
        views: 0,
        available: true,
        featured: false,
        ratings: 0
      };
      
      Object.entries(requiredFields).forEach(([field, defaultValue]) => {
        if (pkg[field] === undefined || pkg[field] === null) {
          console.log(`- Missing required field: ${field}`);
          updates[field] = defaultValue;
          requiresUpdate = true;
        }
      });
      
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
          const result = await packagesCollection.updateOne(
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
    
    console.log(`\nFinished cleanup. Fixed ${fixedCount} out of ${allPackages.length} packages.`);
    
    // Verify if any packages are still using "vendor" field 
    const packagesWithVendor = await packagesCollection.countDocuments({ vendor: { $exists: true } });
    if (packagesWithVendor > 0) {
      console.log(`WARNING: ${packagesWithVendor} packages still have 'vendor' field!`);
      
      // Force remove vendor field from all packages as a last resort
      const forceResult = await packagesCollection.updateMany(
        { vendor: { $exists: true } },
        { $unset: { vendor: "" } }
      );
      
      console.log(`Forcibly removed 'vendor' field from ${forceResult.modifiedCount} packages.`);
    } else {
      console.log('All packages are now using vendorId correctly with no vendor fields.');
    }
    
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 