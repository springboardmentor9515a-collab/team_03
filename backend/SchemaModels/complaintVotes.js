const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintVoteSchema = new Schema({
  complaint_id: {
    type: Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentiment: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    required: true
  }
}, { timestamps: true });

// Prevent duplicate sentiment submissions by same user for a complaint
complaintVoteSchema.index({ complaint_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('ComplaintVote', complaintVoteSchema);
