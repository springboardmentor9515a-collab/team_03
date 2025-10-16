const express = require('express');
const router = express.Router();
const { 
  auth, 
  requireCitizen,
  requireAdmin,
  requireVolunteer,
  requireRoles
} = require('../middleware/auth');
const complaintController = require('../controllers/complaintControllers');

//POST /complaints - Citizen submits complaint
router.post(
  '/',
  auth,
  requireCitizen,                 
  complaintController.createComplaint
);

//GET /complaints - Admin fetches all complaints
router.get(
  '/',
  auth,
  requireAdmin,                   
  complaintController.getAllComplaints
);

//PUT /complaints/:id/assign - Admin assigns complaint to volunteer
router.put(
  '/:id/assign',
  auth,
  requireAdmin,                  
  complaintController.assignComplaint
);

//GET /volunteers/me/complaints - Volunteer gets their assigned complaints
router.get(
  '/volunteers/me/complaints',
  auth,
  requireVolunteer,               
  complaintController.getMyAssignedComplaints
);

//PUT /complaints/:id/status - Volunteer updates status of assigned complaints
router.put(
  '/:id/status',
  auth,
  requireVolunteer,              
  complaintController.updateComplaintStatus
);

module.exports = router;
