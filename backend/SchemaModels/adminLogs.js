const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminLogsSchema = new Schema({
    action: { 
        type: String, 
        required: true,
        trim: true, 
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
},
{
    timestamps: true
});

const adminLogs = mongoose.model('adminLogs', adminLogsSchema);
module.exports = adminLogs;