const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength:100,
        trim: true,
    },
    email: {
        type: String, 
        required: true,
        unique: true, 
        lowercase:true,
        maxlength:150,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 255,
        select: false,
    },
    role: {
        type: String,
        enum: ["citizen", "official"],
        default: "citizen",
        required: true,
    },
    location: {
        type: String,
        required: true,
        maxlength: 250,
        trim: true,
    },
}, 
{timestamps: true});

const user = mongoose.model("user", userSchema);
module.exports = user;
