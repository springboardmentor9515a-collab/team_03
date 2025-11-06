const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Petition = require('../SchemaModels/complaints');
const User = require('../SchemaModels/user');
const {
  auth,
  requireAdmin,
  requireVolunteer,
  // Other middlewares if needed: 
  // requireRole, requireCitizen, requireOfficial, requireRoles, authorize, optionalAuth, checkOwnership
} = require('../middleware/auth');
const emailService = require('../utils/emailService');

const STATUS_VALUES = ['active', 'assigned', 'under_review', 'responded', 'closed'];

// Create petition
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').trim().isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters'),
  body('location').trim().isLength({ min: 5, max: 250 }).withMessage('Location must be between 5 and 250 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { title, description, category, location } = req.body;
  const petition = await Petition.create({
    creator: req.user.id,
    title,
    description,
    category,
    location,
    status: 'active'
  });
  const populatedPetition = await Petition.findById(petition._id).populate('creator', 'name email');
  try {
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
    res.status(201).json({
      success: true,
      message: 'Petition created successfully, but email notification failed',
      petition: populatedPetition,
      warning: 'Email notification could not be sent'
    });
  }
}));

// Get all petitions
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
router.get('/:id', asyncHandler(async (req, res) => {
  const petition = await Petition.findById(req.params.id)
    .populate('creator', 'name email');
  if (!petition) {
    return res.status(404).json({ success: false, error: 'Petition not found' });
  }
  res.json({
    success: true,
    petition
  });
}));

// Get petitions in admin's area
router.get('/local', auth, requireAdmin, asyncHandler(async (req, res) => {
  const petitions = await Petition.find({ location: req.user.location });
  res.json({
    success: true,
    count: petitions.length,
    petitions
  });
}));

// Assign petition to volunteer (admin only)
router.put('/:id/assign', auth, requireAdmin, [
  body('volunteerId').notEmpty().withMessage('Volunteer ID is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const petition = await Petition.findById(req.params.id);
  if (!petition) return res.status(404).json({ success: false, error: 'Petition not found' });

  petition.assigned_to = req.body.volunteerId;
  petition.status = 'assigned';
  petition.status_history.push({
    status: 'assigned',
    changedAt: new Date(),
    changedBy: req.user._id,
    notes: 'Assigned to volunteer'
  });
  await petition.save();
  res.json({
    success: true,
    message: 'Petition assigned to volunteer',
    petition
  });
}));

// Volunteer adds progress notes
router.put('/:id/volunteer-update', auth, requireVolunteer, [
  body('progressNote').isLength({ min: 5 }).withMessage('Progress note is too short')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const petition = await Petition.findById(req.params.id);
  if (!petition) return res.status(404).json({ success: false, error: 'Petition not found' });

  petition.official_response += `\nVolunteer note: ${req.body.progressNote}`;
  petition.status_history.push({
    status: 'under_review',
    changedAt: new Date(),
    changedBy: req.user._id,
    notes: req.body.progressNote
  });

  petition.status = 'under_review';
  await petition.save();

  res.json({
    success: true,
    message: 'Volunteer progress note updated',
    petition
  });
}));

// Admin gives final comment or closes petition
router.put('/:id/respond', auth, requireAdmin, [
  body('finalComment').isLength({ min: 5 }).withMessage('Comment too short'),
  body('close').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const petition = await Petition.findById(req.params.id);
  if (!petition) return res.status(404).json({ success: false, error: 'Petition not found' });

  petition.official_response += `\nAdmin: ${req.body.finalComment}`;
  const newStatus = req.body.close ? 'closed' : 'responded';
  petition.status = newStatus;
  petition.status_history.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: req.user._id,
    notes: req.body.finalComment
  });
  await petition.save();

  res.json({
    success: true,
    message: req.body.close ? 'Petition closed' : 'Admin responded',
    petition
  });
}));

// Update petition status (for admins)
router.put('/:id/status', [
  auth,
  requireAdmin,
  body('status').isIn(STATUS_VALUES).withMessage('Invalid status value')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { status } = req.body;
  const petition = await Petition.findById(req.params.id).populate('creator', 'name email');
  if (!petition) return res.status(404).json({ success: false, error: 'Petition not found' });

  // Authorization: allow admins and officials, or the volunteer assigned to this petition
  const isAdminOrOfficial = req.user.role === 'admin' || req.user.role === 'official';
  const isAssignedVolunteer = petition.assignedVolunteer && petition.assignedVolunteer.toString() === req.user.id;

  if (!isAdminOrOfficial && !isAssignedVolunteer) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update petition status'
    });
  }

  // Update status and append a note/update entry
  petition.status = status;
  petition.status_history.push({
    status: status,
    changedAt: new Date(),
    changedBy: req.user._id
  });
  await petition.save();
  // re-populate updates' author for response
  petition = await Petition.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('updates.author', 'name email');

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
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const petition = await Petition.findById(req.params.id);
  if (!petition) return res.status(404).json({ success: false, error: 'Petition not found' });

  if (petition.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized to delete this petition' });
  }

  await Petition.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Petition deleted successfully' });
}));

module.exports = router;
