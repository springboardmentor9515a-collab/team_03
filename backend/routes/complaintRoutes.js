const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const asyncHandler = require('express-async-handler');
const Complaint = require('../SchemaModels/complaints');  // ✅ Required
const Petition = require('../SchemaModels/petition'); 
// const upload = require('../middleware/upload');
const {
  auth,
  requireCitizen,
  requireAdmin,
  requireVolunteer,
  requireOfficial,
} = require('../middleware/auth');
const complaintController = require('../controllers/complaintControllers');
const multer = require("multer");
const router = express.Router();

// Multer setup for handling file uploads (memory storage -> buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only jpeg/png images allowed"));
  },
});

// Citizen submits complaint
router.post(
  '/',
  auth,
  requireCitizen,
  upload.single('photo'), // file field name: "photo"
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 5, max: 200 }).withMessage('Title must be 5–200 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters'),
    body('category')
      .notEmpty().withMessage('Category is required')
      .isIn([
        'infrastructure','sanitation','utilities','safety','environment','water',
        'electricity','roads','waste_management','other'
      ]).withMessage('Invalid category'),
    body('priority')
      .optional()
      .isIn(['low','medium','high','urgent']).withMessage('Invalid priority')
  ],
  validateRequest,
  complaintController.createComplaint
);
//module.exports = router;


//GET /complaints - Admin fetches all complaints
router.get(
  '/',
  auth,
  requireAdmin,  
  requireAdmin,
  [
    query('status').optional().isIn(['received','in_review','resolved']).withMessage('Invalid status filter'),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ]).withMessage('Invalid category filter'),
    query('priority').optional().isIn(['low','medium','high','urgent']).withMessage('Invalid priority filter'),
    query('assigned_to').optional().isMongoId().withMessage('Invalid volunteer ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
  ],
  validateRequest,                 
  complaintController.getAllComplaints
);

//PUT /complaints/:id/assign - Admin assigns complaint to volunteer
router.put(
  '/:id/assign',
  auth,
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid complaint ID'),
    body('volunteer_id').notEmpty().withMessage('Volunteer ID is required')
      .isMongoId().withMessage('Invalid volunteer ID')
  ],
  validateRequest,           
  complaintController.assignComplaint
);

//GET /volunteers/me/complaints - Volunteer gets their assigned complaints
router.get(
  '/volunteers/me/complaints',
  auth,
  requireVolunteer,  
  [
    query('status').optional().isIn(['received','in_review','resolved']).withMessage('Invalid status filter'),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ]).withMessage('Invalid category filter'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
  ],
  validateRequest,    
  complaintController.getMyAssignedComplaints
);

router.put('/:id/status', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, userRole } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // 🔒 Authorization checks
 if (req.user.role === 'volunteer') {
  const userId = req.user._id || req.user.id; // ✅ handles both token formats
  if (!complaint.assigned_to || complaint.assigned_to.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: 'You are not assigned to this complaint' });
  }
}


  // ✅ Update status + history
  complaint.status = status;
  complaint.status_history.push({
    status,
    changedBy: req.user._id,
    notes: `${userRole || req.user.role} updated status to ${status}`,
    changedAt: new Date(),
  });

  if (status === 'resolved') {
    complaint.resolved_at = new Date();
  }

  await complaint.save().catch((err) => {
    console.error('❌ MongoDB save error:', err);
    throw err;
  });

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    complaint,
  });
}));




// Citizen fetches their own complaints
router.get(
  '/me',
  auth,
  requireCitizen,
  [
    query('status').optional().isIn(['received','in_review','resolved']).withMessage('Invalid status filter'),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ]).withMessage('Invalid category filter'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
  ],
  validateRequest,
  complaintController.getMyComplaints
);

//  GET /complaints/local → Official views complaints in their area
router.get(
  '/local',
  auth,
  requireOfficial,
  async (req, res) => {
    try {
      const location = req.user.location;
      if (!location) {
        return res.status(400).json({ success: false, message: 'Official has no registered location.' });
      }

      const complaints = await Complaint.find({ "location.city": location })
        .populate('created_by', 'name email role')
        .populate('assigned_to', 'name email role')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: complaints.length,
        complaints
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch local complaints', error: error.message });
    }
  }
);

// PUT /complaints/:id/volunteer-update → Volunteer adds progress notes
router.put(
  '/:id/volunteer-update',
  auth,
  requireVolunteer,
  body('progressNote').isLength({ min: 5 }).withMessage('Progress note must be at least 5 characters'),
  validateRequest,
  async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      if (!complaint.assigned_to || complaint.assigned_to.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized for this complaint' });
      }

      complaint.official_response += `\nVolunteer note: ${req.body.progressNote}`;
      complaint.status = 'under_review';
      complaint.status_history.push({
        status: 'under_review',
        changedAt: new Date(),
        changedBy: req.user.id,
        notes: req.body.progressNote
      });

      await complaint.save();

      res.json({ success: true, message: 'Volunteer update saved', complaint });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating complaint', error: error.message });
    }
  }
);

// PUT /complaints/:id/respond → Official gives final comment or closes
router.put(
  '/:id/respond',
  auth,
  requireOfficial,
  [
    body('finalComment').isLength({ min: 5 }).withMessage('Comment too short'),
    body('close').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      complaint.official_response += `\nOfficial: ${req.body.finalComment}`;
      const newStatus = req.body.close ? 'closed' : 'responded';
      complaint.status = newStatus;

      complaint.status_history.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: req.user.id,
        notes: req.body.finalComment
      });

      if (req.body.close) complaint.resolved_at = new Date();

      await complaint.save();

      res.json({
        success: true,
        message: req.body.close ? 'Complaint closed' : 'Official response added',
        complaint
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating complaint', error: error.message });
    }
  }
);


// Complaint filter route
router.get('/filter', auth, async (req, res) => {
  try {
    const { startDate, endDate, city, status, category, title } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (title) filter.title = { $regex: title, $options: 'i' };

    const complaints = await Complaint.find(filter)
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error filtering complaints', error: error.message });
  }
});

// -----------------------------------------------------------------------------
// Sentiment endpoints for complaints (Yes/No/Maybe)
// POST /complaints/:id/sentiment  (authenticated citizens)
// GET  /complaints/:id/sentiment  (public aggregation)
// -----------------------------------------------------------------------------
router.post(
  '/:id/sentiment',
  auth,
  requireCitizen,
  [ body('sentiment').isIn(['Yes','No','Maybe']).withMessage('Sentiment must be Yes, No, or Maybe') ],
  validateRequest,
  complaintController.submitSentiment
);

router.get('/:id/sentiment', complaintController.getSentimentResults);



module.exports = router;

// -----------------------------------------------------------------------------
// Sentiment endpoints for complaints (Yes/No/Maybe)
// POST /complaints/:id/sentiment  (authenticated citizens)
// GET  /complaints/:id/sentiment  (public aggregation)
// -----------------------------------------------------------------------------