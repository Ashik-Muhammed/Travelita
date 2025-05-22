require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useUnifiedTopology: true });
    console.log('Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Update the user
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('Admin password updated successfully.');
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        active: true
      });
      
      // Save to database
      await adminUser.save();
      console.log('Admin user created successfully.');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the function
createAdminUser(); 