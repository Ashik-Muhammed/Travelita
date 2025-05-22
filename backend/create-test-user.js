const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tour-packages');
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('User already exists:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
      return;
    }
    
    // Create a new user with hashed password
    const password = await bcrypt.hash('password123', 10);
    const newUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: password,
      role: 'user'
    });
    
    await newUser.save();
    console.log('User created successfully:', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser(); 