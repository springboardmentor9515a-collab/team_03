const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../SchemaModels/user');

const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Also check for token in x-auth-token header 
  if (!token && req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    // Verify token with fallback secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user without password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Token is not valid. User not found.' 
      });
    }

    // Check if user account is active/verified if needed
    // if (!user.isActive) {
    //   return res.status(401).json({ error: 'Account is deactivated.' });
    // }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token has expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token format.' 
      });
    }

    return res.status(401).json({ 
      success: false,
      error: 'Token is not valid.' 
    });
  }
});

const requireOfficial = (req, res, next) => {
  if (req.user.role !== 'official') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Official role required.' 
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin role required.' 
    });
  }
  next();
};

const requireCitizen = (req, res, next) => {
  if (req.user.role !== 'citizen') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Citizen role required.' 
    });
  }
  next();
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // For optional auth, we just continue without user on error
    next();
  }
});

// Role-based access control that allows multiple roles
const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};

module.exports = { 
  auth, 
  requireOfficial, 
  requireAdmin, 
  requireCitizen,
  requireRoles,
  optionalAuth 
};