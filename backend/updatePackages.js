require('dotenv').config();
const mongoose = require('mongoose');
const TourPackage = require('./models/TourPackage');

const updatePackages = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages');
    console.log('Connected to MongoDB');

    console.log('Fetching all packages...');
    const packages = await TourPackage.find();
    console.log(`Found ${packages.length} packages`);

    let updatedCount = 0;
    for (const pkg of packages) {
      let shouldUpdate = false;

      if (!pkg.hasOwnProperty('views')) {
        console.log(`Package ${pkg._id} missing 'views' field`);
        pkg.views = 0;
        shouldUpdate = true;
      }

      // Handle vendor vs vendorId rename
      if (pkg.hasOwnProperty('vendor') && !pkg.hasOwnProperty('vendorId')) {
        console.log(`Package ${pkg._id} has 'vendor' but not 'vendorId'`);
        pkg.vendorId = pkg.vendor;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await pkg.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} packages`);
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updatePackages(); 