const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Poll title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    options: {
      type: [String],
      required: [true, 'Poll options are required'],
      validate: {
        validator: function(options) {
          return options && options.length >= 2 && options.length <= 10;
        },
        message: 'Poll must have between 2 and 10 options'
      }
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      index: true
    },

    target_location: {
      type: String,
      required: [true, 'Target location is required'],
      trim: true,
      index: true  
    },

    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
      index: true
    },

    end_date: {
      type: Date,
      validate: {
        validator: function(date) {
          if (!date) return true;
          return date > new Date();
        },
        message: 'End date must be in the future'
      }
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

pollSchema.index({ created_by: 1, createdAt: -1 });
pollSchema.index({ target_location: 1, status: 1 });
pollSchema.index({ status: 1, createdAt: -1 });

const Poll = mongoose.model('Poll', pollSchema);
module.exports = Poll;
