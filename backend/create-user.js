const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Configuration
const userData = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'user'
};

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/tour-packages');
    console.log('Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log(`User ${userData.email} already exists, updating password...`);
      
      // Update password directly without using the pre-save hook
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Update user without triggering the pre-save hook that would hash the already hashed password
      await User.updateOne(
        { _id: existingUser._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('Password updated successfully');
      
      // Verify the password works
      const updatedUser = await User.findById(existingUser._id);
      const passwordMatch = await bcrypt.compare(userData.password, updatedUser.password);
      console.log('Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
      
    } else {
      console.log(`Creating new user: ${userData.email}`);
      
      // Create new user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      
      await newUser.save();
      console.log('User created successfully');
    }
    
    // Final verification
    const user = await User.findOne({ email: userData.email });
    console.log('User data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Show part of the password hash for verification
      passwordHash: user.password.substring(0, 20) + '...'
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main(); 