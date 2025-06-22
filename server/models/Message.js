const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  chatType: { type: String, enum: ['private', 'group'], required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'chatType' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Group.rooms' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);