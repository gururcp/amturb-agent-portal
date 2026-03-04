// ============================================================
// OWNER-ONLY MIDDLEWARE
// ============================================================
// Ensures only owner role can access certain routes
// Must be used AFTER authMiddleware
// ============================================================
const owneronly = (req, res, next) => {
  // Check if user info exists (should be set by authMiddleware)
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  // Check if user role is owner
  if (req.user.role !== 'owner') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'This action requires owner privileges'
    });
  }
  next(); // User is owner, proceed
};
module.exports = owneronly;