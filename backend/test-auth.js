const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/tour-packages');
    console.log('Connected to MongoDB');
    
    // Create test user if not exists
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      });
      await user.save();
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }
    
    // Test password comparison
    const passwordMatch = await bcrypt.compare('password123', user.password);
    console.log('Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      // Update password if it doesn't match
      console.log('Updating password...');
      user.password = await bcrypt.hash('password123', 10);
      await user.save();
      console.log('Password updated');
    }
    
    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET || 'tour_packages_secure_jwt_secret_2024';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Generated token:', token);
    console.log('User data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password.substring(0, 10) + '...'
    });
    
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAuth(); 