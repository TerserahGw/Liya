const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    const token = signToken(user._id);
    res.status(201).json({ status: 'success', token, data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Incorrect username or password');
    }
    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token, data: { user } });
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) throw new Error('You are not logged in');
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User no longer exists');
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

exports.getMe = (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};