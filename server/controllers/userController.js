const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { inviteCode: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    }).select('username avatar inviteCode');
    res.status(200).json({ status: 'success', data: { users } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, avatar },
      { new: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ status: 'success', message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
  }
};