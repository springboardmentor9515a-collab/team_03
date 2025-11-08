const Poll = require('../SchemaModels/polls');
const Vote = require('../SchemaModels/votes');
const mongoose = require('mongoose');


exports.createPoll = async (req, res) => {
  try {
    const { title, options, target_location, category, status } = req.body;
    const created_by = req.user.id || req.user._id;


    if (!title || !Array.isArray(options) || options.length === 0 || !target_location) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const poll = new Poll({
      title,
      options,
      target_location,
      status, 
      created_by
    });

    await poll.save();
    res.status(201).json({ message: 'Poll created successfully', poll });
  } catch (error) {
    res.status(500).json({ message: 'Error creating poll', error: error.message });
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    const filter = {};
    if (req.query.target_location) {
      filter.target_location = req.query.target_location;
    }
    const polls = await Poll.find(filter).sort({ createdAt: -1 });
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching polls', error: error.message });
  }
};
// GET single poll by ID (public)
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ data: poll });
  } catch (error) {
    res.status(500).json({ message: "Error fetching poll", error: error.message });
  }
};


exports.submitVote = async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user.id; // populated by authentication middleware
    const { selected_option } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (!poll.options.includes(selected_option)) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    const vote = new Vote({
      poll_id: pollId,
      user_id: userId,
      selected_option
    });

    await vote.save();
    res.status(201).json({ message: "Vote submitted successfully" });
  } catch (error) {
    // Catch unique index error for duplicate voting
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already voted on this poll" });
    }
    res.status(500).json({ message: 'Error submitting vote', error: error.message });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const pollId = req.params.id;

    // Aggregate votes by selected_option
    const results = await Vote.aggregate([
      { $match: { poll_id: new mongoose.Types.ObjectId(pollId) } },
      { $group: { _id: "$selected_option", count: { $sum: 1 } } }
    ]);

    const formatted = {};
    results.forEach(r => { formatted[r._id] = r.count; });

    res.status(200).json({ pollId, results: formatted });
  } catch (error) {
    res.status(500).json({ message: "Error fetching poll results", error: error.message });
  }
};

