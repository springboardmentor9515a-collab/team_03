const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const User = require('../SchemaModels/user');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register user
// POST /api/auth/register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['citizen', 'official', 'admin']).withMessage('Role must be citizen, official, or admin')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { name, email, password, role = 'citizen', location, latitude, longitude } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      success: false,
      error: 'User already exists with this email' 
    });
  }

  const user = await User.create({
    name,
    email,
    password, 
    role,
    location,
    coordinates: (latitude && longitude) ? { latitude, longitude } : undefined,
    locationUpdatedAt: (latitude && longitude) ? new Date() : undefined
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: user.toSafeObject()
  });
}));

// Login user
// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;


  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid email or password' 
    });
  }

  const isValidPassword = await user.matchPassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid email or password' 
    });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toSafeObject()
  });
}));

//Get user profile
//GET /api/auth/profile
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id); // Changed from req.user._id to req.user.id
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    user: user.toSafeObject()
  });
}));

// Update user profile
// PUT /api/auth/profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { name, location, latitude, longitude } = req.body;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (location) updateData.location = location;
  if (latitude && longitude) {
    updateData.coordinates = { latitude, longitude };
    updateData.locationUpdatedAt = new Date();
  }

  const user = await User.findByIdAndUpdate(
    req.user.id, 
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toSafeObject()
  });
}));

router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth routes are working!' 
  });
});

module.exports = router;
