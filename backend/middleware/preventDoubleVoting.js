const Vote = require('../SchemaModels/votes');

module.exports = async function preventDoubleVoting(req, res, next) {
  const pollId = req.params.id;
  const userId = req.user.id || req.user._id;
  const vote = await Vote.findOne({ poll_id: pollId, user_id: userId });
  if (vote) {
    return res.status(409).json({ message: "You have already voted on this poll." });
  }
  next();
};
