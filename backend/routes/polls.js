const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const validatePollData = require('../middleware/validatePoll');      // Create this middleware (see prior steps)
const preventDoubleVoting = require('../middleware/preventDoubleVoting');
const { getPollSentiment } = require('../controllers/polls');  // Create this middleware (see prior steps)
const {
  createPoll,
  getAllPolls,
  getPollById, 
  submitVote,
  getPollResults
} = require('../controllers/polls');

// GET all polls (with optional filter, public)
router.get('/', getAllPolls);

// Official/Admin creates a poll (protected, validated)
router.post(
  '/',
  auth,
  authorize('admin', 'official'),
  validatePollData,
  createPoll
);

// Citizen submits a vote (protected, one vote per poll)
router.post(
  '/:id/vote',
  auth,
  authorize('citizen'),      
  preventDoubleVoting,
  submitVote
);
// GET single poll by ID (public)
router.get('/:id', getPollById);

// GET poll results (public)
router.get('/:id/results', getPollResults);
 
//results 
router.get('/:id/sentiment', getPollSentiment);

module.exports = router;