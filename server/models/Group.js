const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  avatar: { type: String, default: '' },
  type: { type: String, enum: ['gaming', 'social', 'mystery', 'political', 'other'], default: 'social' },
  inviteCode: { type: String, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  roles: [{
    name: { type: String, required: true },
    color: { type: String, default: '#4caf50' },
    permissions: [{ type: String }],
    rank: { type: Number, default: 10 }
  }],
  rooms: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['public', 'private'], default: 'public' },
    permissions: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

GroupSchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Group', GroupSchema);