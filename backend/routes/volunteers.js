const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Petition = require('../SchemaModels/petition');
const User = require('../SchemaModels/user');
const { auth } = require('../middleware/auth');
const emailService = require('../utils/emailService');

// Assign volunteer to petition
// POST /api/volunteers/assign
router.post('/assign', [
  auth,
  body('petitionId').isMongoId().withMessage('Valid petition ID required'),
  body('volunteerEmail').isEmail().withMessage('Valid volunteer email required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { petitionId, volunteerEmail } = req.body;

  // Check if user has permission to assign volunteers (admin or official)
  if (req.user.role !== 'admin' && req.user.role !== 'official') {
    return res.status(403).json({
      success: false,
      error: 'Only admins and officials can assign volunteers'
    });
  }

  // Find petition
  const petition = await Petition.findById(petitionId).populate('creator', 'name email');
  if (!petition) {
    return res.status(404).json({
      success: false,
      error: 'Petition not found'
    });
  }

  // Find volunteer user
  const volunteer = await User.findOne({ email: volunteerEmail });
  if (!volunteer) {
    return res.status(404).json({
      success: false,
      error: 'Volunteer not found with this email'
    });
  }

  // Send assignment notification email to volunteer
  try {
    await emailService.sendVolunteerAssignmentEmail({
      to: volunteer.email,
      volunteerName: volunteer.name,
      petitionTitle: petition.title,
      petitionId: petition._id,
      creatorName: petition.creator.name
    });

    res.json({
      success: true,
      message: 'Volunteer assigned successfully and notification email sent',
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email
      },
      petition: {
        id: petition._id,
        title: petition.title
      }
    });
  } catch (emailError) {
    console.error('Volunteer assignment email failed:', emailError);
    res.status(500).json({
      success: false,
      error: 'Failed to send volunteer assignment notification'
    });
  }
}));

// Get all volunteers
// GET /api/volunteers
router.get('/', auth, asyncHandler(async (req, res) => {
  // Only admins can view all volunteers
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can view all volunteers'
    });
  }

  const volunteers = await User.find({ role: 'citizen' })
    .select('name email location createdAt')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: volunteers.length,
    volunteers
  });
}));

module.exports = router;
