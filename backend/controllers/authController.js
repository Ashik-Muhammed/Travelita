const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tour_packages_secure_jwt_secret_2024';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        details: 'Please use a different email address'
      });
    }

    // Create new user - don't hash password here, let the model's pre-save hook handle it
    const user = new User({
      name,
      email,
      password, // Plain password - will be hashed by the model's pre-save hook
      role: 'user'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Auth login endpoint hit with request body:', {
      ...req.body,
      password: req.body.password ? '[HIDDEN]' : undefined
    });
    
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Login failed: Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Find user
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Verify password
    console.log('User found, comparing passwords');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for user:', email);
      return res.status(401).json({
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Update last login
    console.log('Password valid, updating last login time');
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    console.log('Generating JWT token for user:', {
      id: user._id,
      role: user.role
    });
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
  }
};
