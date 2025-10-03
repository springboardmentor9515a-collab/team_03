// SchemaModels/blacklistToken.js
const mongoose = require('mongoose');

const BlacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.JWT_EXPIRE || '7d' // Auto-delete when token would expire
  }
});

module.exports = mongoose.model('BlacklistToken', BlacklistTokenSchema);
