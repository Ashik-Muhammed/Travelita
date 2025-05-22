require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages';

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useUnifiedTopology: true });
    console.log('Connected to MongoDB successfully');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log({
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active,
        passwordHash: adminUser.password.substring(0, 20) + '...' // Show partial hash for verification
      });

      // Check User model
      console.log('\nUser model schema:');
      const userModelPaths = Object.keys(User.schema.paths);
      console.log(userModelPaths);
    } else {
      console.log('Admin user NOT found in the database');
      
      // List all users
      console.log('\nAll users in database:');
      const users = await User.find();
      users.forEach(user => {
        console.log(`- ${user.email} (${user.role})`);
      });
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

// Run the function
checkAdminUser(); 