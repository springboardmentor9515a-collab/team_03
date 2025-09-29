const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const signatureSchema = new Schema({
    petition_id: {
        type: Schema.Types.ObjectId,
        ref: "petition",
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true, 
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, 
{timestamps: true});

signatureSchema.index({ 
    petition_id: 1, 
    user_id: 1, 
}, 
{ 
    unique: true, 
});

const signatures = mongoose.model('signatures', signatureSchema);
model.exports = signatures;