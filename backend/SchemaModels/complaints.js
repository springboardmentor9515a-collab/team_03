const mongoose = require('mongoose');

const statusValues = ['active', 'assigned', 'in_review','resolved'];

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: statusValues,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: { type: String, trim: true, maxlength: 500 }
}, { _id: false });

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
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: statusValues, default: 'active' },
    priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
    resolved_at: { type: Date, default: null },
    admin_notes: { type: String, maxlength: 500 },
    official_response: { type: String, trim: true, maxlength: 2000, default: '' },
    status_history: { type: [statusHistorySchema], default: [] }
  },
  { timestamps: true }
);

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assigned_to: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
