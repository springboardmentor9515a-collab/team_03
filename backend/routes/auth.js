const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const User = require('../SchemaModels/user');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

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

// Change password
// PUT /api/auth/change-password
router.put('/change-password', auth, [
  body('oldPassword').exists().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: 'Old password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
}));

router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth routes are working!' 
  });
});

module.exports = router;

// Forgot Password
// POST /api/auth/forgot-password
const nodemailer = require('nodemailer');
router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email required')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ashritha.g2004@gmail.com',
      pass: 'ndzqznfzmdqyxxul'
    }
  });

  const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${token}`;
  const mailOptions = {
    from: 'ashritha.g2004@gmail.com',
    to: user.email,
    subject: 'Password Reset Request',
    text: `Hello ${user.name},\n\nYou requested a password reset for your account. Click the link below to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThank you.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, error: 'Failed to send reset email.' });
  }
}));

// Reset Password
// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').exists().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { token, newPassword } = req.body;
  const user = await User.findOne({ 
    resetPasswordToken: token, 
    resetPasswordExpires: { $gt: Date.now() } 
  });
  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully' });
}));
