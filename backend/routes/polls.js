const express = require('express');
const router = express.Router();
const Poll = require('../SchemaModels/polls');
const Vote = require('../SchemaModels/votes');
const { auth } = require('../middleware/auth');
const { aggregatePollResults, invalidateCache } = require('../utils/aggregationService');

// Create a new poll
router.post('/', auth, async (req, res) => {
  try {
    const { title, options, target_location } = req.body;
    
    if (!title || !options || !target_location) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const newPoll = new Poll({
      title,
      options,
      created_by: req.user.id,
      target_location
    });
    
    await newPoll.save();
    
    res.status(201).json({ success: true, data: newPoll });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().populate('created_by', 'name email');
    res.json({ success: true, data: polls });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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

// Vote on a poll
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { selected_option } = req.body;
    
    if (!selected_option) {
      return res.status(400).json({ success: false, message: 'Selected option is required' });
    }
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    // Check if option is valid
    if (!poll.options.includes(selected_option)) {
      return res.status(400).json({ success: false, message: 'Invalid option selected' });
    }
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ poll_id: req.params.id, user_id: req.user.id });
    
    if (existingVote) {
      // Update existing vote
      existingVote.selected_option = selected_option;
      await existingVote.save();
    } else {
      // Create new vote
      const newVote = new Vote({
        poll_id: req.params.id,
        user_id: req.user.id,
        selected_option
      });
      
      await newVote.save();
    }
    
    // Invalidate cache for this poll
    invalidateCache(req.params.id);
    
    res.json({ success: true, message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get aggregated results for a poll
router.get('/:id/results', async (req, res) => {
  try {
    const pollId = req.params.id;
    
    // Check if poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    // Get aggregated results
    const results = await aggregatePollResults(pollId);
    
    res.json({ 
      success: true, 
      data: {
        poll: {
          id: poll._id,
          title: poll.title,
          options: poll.options
        },
        results: results.counts,
        percentages: results.percentages,
        total_votes: results.total
      }
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
