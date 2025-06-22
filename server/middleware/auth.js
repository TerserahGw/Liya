const jwt = require('jsonwebtoken');
const User = require('../models/User');

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