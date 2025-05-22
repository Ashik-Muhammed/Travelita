const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin login
exports.login = async (req, res) => {
  try {
    console.log('--- ADMIN LOGIN ATTEMPT ---');
    console.log('Request body:', {
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    });
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user._id, email: user.email, role: user.role });
    
    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('User is not an admin. Role:', user.role);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallbacksecretkey';
    console.log('Using JWT_SECRET:', jwtSecret ? 'Secret is set' : 'No secret available');
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log(`Admin login successful: ${user.email} (${user._id})`);

    // Return token and user information
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error getting admin profile:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
}; 