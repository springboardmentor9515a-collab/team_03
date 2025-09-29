const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200,
    },
    options:[{
        type: String,
        required: true,
        trim: true,
    }],
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    target_location: {
        type: String,
        required: true,
        trim: true,
        maxLength: 250,
    }
}, 
{timestamps: true});

const polls = mongoose.model('polls', pollsSchema);
module.exports = polls;