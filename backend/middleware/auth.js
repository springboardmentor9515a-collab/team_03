const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../SchemaModels/user');
const BlacklistToken = require('../SchemaModels/blacklistToken'); 

const auth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.',
      error: 'Not authorized to access this route. Please login.'
    });
  }

  try {
    if (BlacklistToken) {
      const blacklisted = await BlacklistToken.findOne({ token });
      if (blacklisted) {
        return res.status(401).json({ 
          success: false,
          message: 'Token is no longer valid. Please login again.',
          error: 'Token has been revoked'
        });
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found',
        error: 'Token is not valid. User not found.'
      });
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is not active. Please contact support.',
        error: 'Account is suspended or inactive'
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      location: user.location,
      phone: user.phone
    };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.',
        error: 'TokenExpiredError'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format.',
        error: 'JsonWebTokenError'
      });
    }

    return res.status(401).json({ 
      success: false,
      message: 'Token is not valid.',
      error: error.message
    });
  }
});

const protect = auth;


// Citizen: can only create complaints
const requireCitizen = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'citizen') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Citizen role required.',
      error: `Role '${req.user.role}' is not authorized`
    });
  }
  next();
};

// Official: can assign complaints to volunteers
const requireOfficial = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'official') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Official role required.',
      error: `Role '${req.user.role}' is not authorized`
    });
  }
  next();
};

// Volunteer: can view and resolve assigned complaints
const requireVolunteer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Volunteer role required.',
      error: `Role '${req.user.role}' is not authorized`
    });
  }
  next();
};

// Admin: can view all complaints (superuser)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin role required.',
      error: `Role '${req.user.role}' is not authorized`
    });
  }
  next();
};

// Multiple roles allowed
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.', error: 'User not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        error: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Alias
const authorize = requireRoles;

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) { return next(); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.status === 'active') {
      req.user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        location: user.location
      };
    }
    next();
  } catch (error) {
    next();
  }
});

const checkOwnership = (resourceField = 'created_by') => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    if (req[resourceField] && req[resourceField].toString() === req.user.id) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource',
      error: 'You do not have permission to perform this action'
    });
  };
};

// Single-role middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.',
        error: 'User not authenticated'
      });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} role required.`,
        error: `User role '${req.user.role}' is not authorized`
      });
    }
    next();
  };
};

module.exports = { 
  auth,
  protect,
  requireRole,
  requireCitizen,
  requireOfficial,
  requireVolunteer,
  requireAdmin,
  requireRoles,
  authorize,
  optionalAuth,
  checkOwnership
};


