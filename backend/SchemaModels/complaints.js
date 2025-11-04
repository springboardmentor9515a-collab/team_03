const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    category: {
      type: String,
      required: true,
      enum: [
        'infrastructure','sanitation','utilities','safety','environment','water',
        'electricity','roads','waste_management','other'
      ]
    },
    photo_url: { type: String, trim: true},
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: { 
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: { type: String, trim: true },
      city: String,
      state: String,
      pincode: String
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['received','in_review','resolved'], default: 'received' },
    priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
    resolved_at: { type: Date, default: null },
    admin_notes: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

// Indexes
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assigned_to: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
