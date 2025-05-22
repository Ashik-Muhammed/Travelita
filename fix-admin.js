require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Use the exact same import path as in authController.js
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages';

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useUnifiedTopology: true });
    console.log('Connected to MongoDB successfully');

    console.log('Finding User model...');
    // Log available models to verify the model is registered correctly
    console.log('Mongoose models:', Object.keys(mongoose.models));
    
    // Check for the User model specifically
    if (mongoose.models.User) {
      console.log('User model found in mongoose models');
    } else {
      console.log('User model NOT found in mongoose models!');
    }

    // Check for existing admin
    console.log('Checking for existing admin...');
    let user = await User.findOne({ email: 'admin@gmail.com' });
    
    if (user) {
      console.log('Admin user found in database. Updating password...');
      console.log('Current user info:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      
      // Generate hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Update password directly to avoid pre-save hook
      user.password = hashedPassword;
      await user.save();
      
      console.log('Password updated successfully.');
    } else {
      console.log('No admin found. Creating new admin user...');
      
      // Generate hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Create new admin user
      user = new User({
        name: 'Administrator',
        email: 'admin@gmail.com',
        password: hashedPassword,  // Already hashed, model shouldn't hash again
        role: 'admin'
      });
      
      await user.save();
      console.log('Admin user created successfully:', user.email);
    }
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser(); 