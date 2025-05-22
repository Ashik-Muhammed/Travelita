const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // 💡 So you can use req.user._id in route
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };
