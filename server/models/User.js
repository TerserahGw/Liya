const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  status: { type: String, default: 'online' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FriendRequest' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  inviteCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);