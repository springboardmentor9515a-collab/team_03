const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Status values for workflow
const statusValues = ["active", "assigned", "in_review", "resolved", "closed"];

// Status history schema
const statusHistorySchema = new Schema({
  status: {
    type: String,
    enum: statusValues,
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: String,
}, { _id: false });

// Complaint schema with all features from Petition and previous Complaint
const complaintSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 200 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: [
      'infrastructure', 'sanitation', 'utilities', 'safety', 'environment',
      'water', 'electricity', 'roads', 'waste_management', 'other'
    ]
  },
  photo_url: { type: String, trim: true },
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
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // Official or volunteer
  status: {
    type: String,
    enum: statusValues,
    default: 'active',
    required: true,
  },
  status_history: {
    type: [statusHistorySchema],
    default: []
  },
  official_response: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ""
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  resolved_at: { type: Date, default: null },
  admin_notes: { type: String, maxlength: 500 }
}, { timestamps: true });

// Relevant indexes
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assigned_to: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
