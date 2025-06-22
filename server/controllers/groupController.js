const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const group = await Group.create({
      name,
      description,
      type,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'creator' }],
      roles: [
        { name: 'creator', permissions: ['all'], color: '#d4a017', rank: 100 },
        { name: 'admin', permissions: ['manage_messages', 'kick_members', 'ban_members', 'manage_roles', 'manage_rooms'], color: '#f44336', rank: 90 },
        { name: 'member', permissions: ['send_messages'], color: '#4caf50', rank: 10 }
      ],
      rooms: [
        { name: 'General', permissions: ['send_messages'] },
        { name: 'Admin', type: 'private', permissions: ['admin'] }
      ]
    });
    await User.findByIdAndUpdate(req.user._id, { $push: { groups: group._id } });
    res.status(201).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id });
    res.status(200).json({ status: 'success', data: { groups } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group.members.some(m => m.user.equals(req.user._id))) {
      throw new Error('You are not a member of this group');
    }
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { name, description, type, avatar } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': 'creator' },
      { name, description, type, avatar },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not the creator');
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) throw new Error('Group not found');
    if (group.members.some(m => m.user.equals(req.user._id))) {
      throw new Error('You are already a member');
    }
    group.members.push({ user: req.user._id, role: 'member' });
    await group.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { groups: group._id } });
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) throw new Error('Group not found');
    const memberIndex = group.members.findIndex(m => m.user.equals(req.user._id));
    if (memberIndex === -1) throw new Error('You are not a member');
    group.members.splice(memberIndex, 1);
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(req.params.id);
    } else {
      if (group.members[memberIndex].role === 'creator') {
        const newCreator = group.members.find(m => m.role === 'admin') || group.members[0];
        newCreator.role = 'creator';
      }
      await group.save();
    }
    await User.findByIdAndUpdate(req.user._id, { $pull: { groups: group._id } });
    res.status(200).json({ status: 'success', message: 'Left group' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, permissions, color, rank } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': 'creator' },
      { $push: { roles: { name, permissions, color, rank } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not the creator');
    res.status(201).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, permissions, color, rank } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': 'creator', 'roles._id': req.params.roleId },
      { $set: { 'roles.$': { _id: req.params.roleId, name, permissions, color, rank } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not the creator');
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': 'creator' },
      { $pull: { roles: { _id: req.params.roleId } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not the creator');
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, description, type, permissions } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': { $in: ['creator', 'admin'] } },
      { $push: { rooms: { name, description, type, permissions } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not authorized');
    res.status(201).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { name, description, type, permissions } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': { $in: ['creator', 'admin'] }, 'rooms._id': req.params.roomId },
      { $set: { 'rooms.$': { _id: req.params.roomId, name, description, type, permissions } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not authorized');
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': { $in: ['creator', 'admin'] } },
      { $pull: { rooms: { _id: req.params.roomId } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not authorized');
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': { $in: ['creator', 'admin'] } },
      { $addToSet: { members: { user: req.params.userId, role: 'member' } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not authorized');
    await User.findByIdAndUpdate(req.params.userId, { $addToSet: { groups: group._id } });
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { role } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': { $in: ['creator', 'admin'] }, 'members.user': req.params.userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not authorized');
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members.user': req.user._id, 'members.role': { $in: ['creator', 'admin'] } },
      { $pull: { members: { user: req.params.userId } } },
      { new: true }
    );
    if (!group) throw new Error('Group not found or you are not authorized');
    await User.findByIdAndUpdate(req.params.userId, { $pull: { groups: group._id } });
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};