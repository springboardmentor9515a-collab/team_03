const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
    updates: [
        {
            author: { type: Schema.Types.ObjectId, ref: 'User' },
            role: { type: String },
            note: { type: String, trim: true },
            status: { type: String, enum: ["received", "in_review", "resolved"] },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    assignedVolunteer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: ["received", "in_review", "resolved"], 
        default:"received",
    },
}, 
{timestamps: true});

const petition = mongoose.model('petition', petitionSchema);
module.exports = petition;