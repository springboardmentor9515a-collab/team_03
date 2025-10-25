const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const votesSchema = new Schema({
    poll_id: {
        type: Schema.Types.ObjectId,
        ref: 'poll',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    selected_option: {
        type: String,
        required: true,
        maxLength: 100,
    },
},
{timestamps: true});

votesSchema.index({
    poll_id: 1, user_id: 1
}, 
{
    unique: true
});

const Vote = mongoose.model('votes', votesSchema);
module.exports = Vote;