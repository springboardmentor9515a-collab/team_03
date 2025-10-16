const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Petition = require('../SchemaModels/petition');
const User = require('../SchemaModels/user');
const { auth } = require('../middleware/auth');
const emailService = require('../utils/emailService');

// Create petition (complaint submission)
// POST /api/petitions
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').trim().isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters'),
  body('location').trim().isLength({ min: 5, max: 250 }).withMessage('Location must be between 5 and 250 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { title, description, category, location } = req.body;

  // Create petition
  const petition = await Petition.create({
    creator: req.user.id,
    title,
    description,
    category,
    location,
    status: 'received'
  });

  // Populate creator details for email
  const populatedPetition = await Petition.findById(petition._id).populate('creator', 'name email');

  try {
    // Send confirmation email to user
    await emailService.sendPetitionConfirmationEmail({
      to: populatedPetition.creator.email,
      userName: populatedPetition.creator.name,
      petitionTitle: petition.title,
      petitionId: petition._id,
      category: petition.category,
      location: petition.location
    });

    res.status(201).json({
      success: true,
      message: 'Petition created successfully and confirmation email sent',
      petition: populatedPetition
    });
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Still return success for petition creation, but log email error
    res.status(201).json({
      success: true,
      message: 'Petition created successfully, but email notification failed',
      petition: populatedPetition,
      warning: 'Email notification could not be sent'
    });
  }
}));

// Get all petitions
// GET /api/petitions
router.get('/', asyncHandler(async (req, res) => {
  const petitions = await Petition.find()
    .populate('creator', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: petitions.length,
    petitions
  });
}));

// Get single petition
// GET /api/petitions/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const petition = await Petition.findById(req.params.id)
    .populate('creator', 'name email');

  if (!petition) {
    return res.status(404).json({
      success: false,
      error: 'Petition not found'
    });
  }

  res.json({
    success: true,
    petition
  });
}));

// Update petition status (for officials/admins)
// PUT /api/petitions/:id/status
router.put('/:id/status', [
  auth,
  body('status').isIn(['received', 'in_review', 'resolved']).withMessage('Status must be received, in_review, or resolved')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { status } = req.body;
  const petition = await Petition.findById(req.params.id).populate('creator', 'name email');

  if (!petition) {
    return res.status(404).json({
      success: false,
      error: 'Petition not found'
    });
  }

  petition.status = status;
  await petition.save();

  // Send status update email to petition creator
  try {
    await emailService.sendStatusUpdateEmail({
      to: petition.creator.email,
      userName: petition.creator.name,
      petitionTitle: petition.title,
      newStatus: status,
      petitionId: petition._id
    });
  } catch (emailError) {
    console.error('Status update email failed:', emailError);
  }

  res.json({
    success: true,
    message: 'Petition status updated successfully',
    petition
  });
}));

// Delete petition (only by creator or admin)
// DELETE /api/petitions/:id
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const petition = await Petition.findById(req.params.id);

  if (!petition) {
    return res.status(404).json({
      success: false,
      error: 'Petition not found'
    });
  }

  // Check if user is creator or admin
  if (petition.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this petition'
    });
  }

  await Petition.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Petition deleted successfully'
  });
}));

module.exports = router;
