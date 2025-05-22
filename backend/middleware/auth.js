const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tour_packages_secure_jwt_secret_2024';

const authMiddleware = (req, res, next) => {
  try {
    // Log request details for debugging
    console.log('Auth middleware - Request details:', {
      path: req.path,
      method: req.method,
      query: req.query,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
      }
    });

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Auth error: Invalid authorization header format');
      return res.status(401).json({ 
        message: 'Authorization token missing or invalid',
        details: 'Please log in to continue'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Auth middleware - Token extracted:', token ? 'Present' : 'Missing');

    try {
      console.log('Auth middleware - Attempting to verify token with SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'NO SECRET');
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Handle both user tokens and vendor tokens
      if (decoded.vendorId) {
        console.log('Auth success: Vendor token detected for vendor:', {
          vendorId: decoded.vendorId,
          exp: decoded.exp,
          iat: decoded.iat
        });
        
        // For vendor tokens, create a compatible user object with vendor role
        req.user = {
          id: decoded.vendorId,
          role: 'vendor',
          exp: decoded.exp,
          iat: decoded.iat
        };
        next();
        return;
      }
      
      // Regular user token
      console.log('Auth success: User token verified for user:', {
        id: decoded.id,
        role: decoded.role,
        exp: decoded.exp,
        iat: decoded.iat
      });

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.error('Auth error: Token has expired');
        return res.status(401).json({
          message: 'Token has expired',
          details: 'Please log in again'
        });
      }

      // Validate user ID
      if (!decoded.id) {
        console.error('Auth error: No user ID in token');
        return res.status(401).json({
          message: 'Invalid token',
          details: 'Token does not contain user information'
        });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error('Auth error: Token verification failed:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token has expired',
          details: 'Please log in again'
        });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token',
          details: 'Please log in again'
        });
      }

      return res.status(401).json({
        message: 'Token is not valid',
        details: 'Please log in again'
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({
      message: 'Authentication error',
      details: 'An unexpected error occurred during authentication'
    });
  }
};

module.exports = authMiddleware;
