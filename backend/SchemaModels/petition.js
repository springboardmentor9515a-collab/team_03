const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusValues = ["active", "assigned", "under_review", "responded", "closed"];

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
    notes: String
}, {_id: false});

const petitionSchema = new Schema({
    creator: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true, 
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250,
    },
    status: {
        type: String,
        enum: statusValues,
        default: "active",
        required: true,
    },
    assigned_to: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    official_response: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
    },
    status_history: {
        type: [statusHistorySchema],
        default: []
    }
}, 
{timestamps: true});

const petition = mongoose.model('petition', petitionSchema);
module.exports = petition;