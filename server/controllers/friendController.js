const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username avatar status');
    res.status(200).json({ status: 'success', data: { friends: user.friends } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (req.user._id.equals(recipientId)) throw new Error('Cannot send request to yourself');
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient: recipientId },
        { sender: recipientId, recipient: req.user._id }
      ]
    });
    if (existingRequest) throw new Error('Friend request already exists');
    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      recipient: recipientId
    });
    await User.findByIdAndUpdate(recipientId, { $push: { friendRequests: friendRequest._id } });
    res.status(201).json({ status: 'success', data: { friendRequest } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('sender', 'username avatar');
    res.status(200).json({ status: 'success', data: { friendRequests } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  try {
    const { response } = req.body;
    const friendRequest = await FriendRequest.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, status: 'pending' },
      { status: response },
      { new: true }
    );
    if (!friendRequest) throw new Error('Friend request not found');
    if (response === 'accepted') {
      await User.findByIdAndUpdate(req.user._id, { $push: { friends: friendRequest.sender } });
      await User.findByIdAndUpdate(friendRequest.sender, { $push: { friends: req.user._id } });
    }
    await User.findByIdAndUpdate(req.user._id, { $pull: { friendRequests: friendRequest._id } });
    res.status(200).json({ status: 'success', data: { friendRequest } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { friends: req.user._id } });
    res.status(200).json({ status: 'success', message: 'Friend removed' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};