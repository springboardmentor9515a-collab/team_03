const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'infrastructure',
          'sanitation',
          'utilities',
          'safety',
          'environment',
          'water',
          'electricity',
          'roads',
          'waste_management',
          'other'
        ],
        message: '{VALUE} is not a valid category'
      },
      index: true
    },

    photo_url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; 
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: 'Please provide a valid image URL'
      }
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(coords) {
            if (!coords || coords.length === 0) return true; 
            return coords.length === 2 &&
                   coords[0] >= -180 && coords[0] <= 180 &&
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates format [longitude, latitude]'
        }
      },
      address: {
        type: String,
        trim: true
      },
      city: String,
      state: String,
      pincode: String
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },

    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    status: {
      type: String,
      enum: {
        values: ['received', 'in_review', 'resolved'],
        message: '{VALUE} is not a valid status'
      },
      default: 'received',
      index: true
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    resolved_at: {
      type: Date,
      default: null
    },

    admin_notes: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assigned_to: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ assigned_to: 1, status: 1 });
complaintSchema.index({ location: '2dsphere' });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
