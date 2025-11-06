const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const {
  auth,
  requireCitizen,
  requireVolunteer,
  requireAdmin,
  requireRoles // must be imported
} = require('../middleware/auth');
const complaintController = require('../controllers/complaintControllers');
const multer = require("multer");
const router = express.Router();

// For image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only jpeg/png images allowed"));
  },
});

// --- Already Existing Citizen, Admin, Volunteer Complaint Routes (Keep as is) ---

router.post(
  '/',
  auth,
  requireCitizen,
  upload.single('photo'),
  [
    body('title').trim().notEmpty().isLength({ min: 5, max: 200 }),
    body('description').trim().notEmpty().isLength({ min: 10, max: 2000 }),
    body('category').notEmpty().isIn([
      'infrastructure', 'sanitation', 'utilities', 'safety', 'environment', 'water',
      'electricity', 'roads', 'waste_management', 'other'
    ]),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  validateRequest,
  complaintController.createComplaint
);

router.get(
  '/',
  auth,
  requireAdmin,
  [
    query('status').optional().isIn(['received','in_review','resolved']),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ]),
    query('priority').optional().isIn(['low','medium','high','urgent']),
    query('assigned_to').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 })
  ],
  validateRequest,
  complaintController.getAllComplaints
);

// Assign complaint to volunteer (admin/official)
router.put(
  '/:id/assign',
  auth,
  requireRoles('admin', 'official'),  // <-- validated middleware with arguments
  [
    param('id').isMongoId(),
    body('volunteer_id').notEmpty().isMongoId()
  ],
  validateRequest,
  complaintController.assignComplaint
);

router.get(
  '/volunteers/me/complaints',
  auth,
  requireVolunteer,
  [
    query('status').optional().isIn(['received','in_review','resolved']),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ]),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 })
  ],
  validateRequest,
  complaintController.getMyAssignedComplaints
);

router.put(
  '/:id/status',
  auth,
  requireVolunteer,
  [
    param('id').isMongoId(),
    body('status').notEmpty().isIn(['received','in_review','resolved']),
    body('admin_notes').optional().isLength({ max: 500 })
  ],
  validateRequest,
  complaintController.updateComplaintStatus
);

router.get(
  '/me',
  auth,
  requireCitizen,
  [
    query('status').optional().isIn(['received','in_review','resolved']),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ]),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 })
  ],
  validateRequest,
  complaintController.getMyComplaints
);

//  Newly Added Routes 

// GET /complaints/local → Official/Admin views complaints in their area
router.get(
  '/local',
  auth,
  requireRoles('admin', 'official'), // <-- validated middleware with arguments
  [
    query('status').optional().isIn(['active', 'assigned', 'under_review', 'responded', 'closed']),
    query('category').optional().isIn([
      'infrastructure','sanitation','utilities','safety','environment','water',
      'electricity','roads','waste_management','other'
    ])
  ],
  validateRequest,
  complaintController.getLocalComplaints
);

// PUT /complaints/:id/volunteer-update → Volunteer adds progress notes
router.put(
  '/:id/volunteer-update',
  auth,
  requireVolunteer,
  [
    param('id').isMongoId(),
    body('progressNote').isLength({ min: 5 }).withMessage('Progress note is too short')
  ],
  validateRequest,
  complaintController.volunteerUpdateComplaint
);

// PUT /complaints/:id/respond → Official/Admin gives final comment or closes complaint
router.put(
  '/:id/respond',
  auth,
  requireRoles('admin', 'official'), // <-- validated middleware with arguments
  [
    param('id').isMongoId(),
    body('finalComment').isLength({ min: 5 }).withMessage('Comment too short'),
    body('close').optional().isBoolean()
  ],
  validateRequest,
  complaintController.respondComplaint
);

// -----------------------------------------------------------------------------
// Sentiment endpoints for complaints (Yes/No/Maybe)
// POST /complaints/:id/sentiment  (authenticated citizens)
// GET  /complaints/:id/sentiment  (public aggregation)
// -----------------------------------------------------------------------------