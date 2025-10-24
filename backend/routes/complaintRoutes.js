const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
// const upload = require('../middleware/upload');
const { auth, requireCitizen, requireAdmin, requireVolunteer } = require('../middleware/auth');
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

module.exports = router;


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

//PUT /complaints/:id/status - Volunteer updates status of assigned complaints
router.put(
  '/:id/status',
  auth,
  requireVolunteer,    
  [
    param('id').isMongoId().withMessage('Invalid complaint ID'),
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['received','in_review','resolved']).withMessage('Invalid status'),
    body('admin_notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Admin notes max 500 characters')
  ],
  validateRequest,          
  complaintController.updateComplaintStatus
);

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


module.exports = router;
