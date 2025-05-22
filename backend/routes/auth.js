const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add role from token to response
    user.role = req.user.role;
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
