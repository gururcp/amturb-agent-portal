// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ← CHANGED TO LOWERCASE
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Please login to access this resource'
      });
    }
    // Get token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Your session has expired. Please login again.'
      });
    }
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-pin');
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'This account no longer exists'
      });
    }
    // Check if user is active (not deactivated)
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Contact administrator.'
      });
    }
    // Attach user info to request object
    req.user = {
      userId: user._id.toString(),
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      mustChangePIN: user.mustChangePIN
    };
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};
module.exports = authMiddleware;