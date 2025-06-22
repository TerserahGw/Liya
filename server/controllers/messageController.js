const Message = require('../models/Message');

exports.getPrivateMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatType: 'private',
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    }).sort('createdAt');
    res.status(200).json({ status: 'success', data: { messages } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatType: 'group',
      recipient: req.params.groupId
    }).sort('createdAt');
    res.status(200).json({ status: 'success', data: { messages } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, type, chatType, recipient, room } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      content,
      type,
      chatType,
      recipient,
      room
    });
    res.status(201).json({ status: 'success', data: { message } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      sender: req.user._id
    });
    if (!message) throw new Error('Message not found or you are not the sender');
    res.status(200).json({ status: 'success', message: 'Message deleted' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};