const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 4, // 4 attempts per window per IP
  message: {
    success: false,
    error: 'Too many login attempts, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour per IP
  message: {
    success: false,
    error: 'Too many registration attempts, please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

module.exports = {
  loginLimiter,
  registerLimiter,
  generalLimiter
};
