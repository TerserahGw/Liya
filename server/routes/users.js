const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/search', userController.searchUsers);
router.put('/update', userController.updateProfile);
router.put('/update-password', userController.updatePassword);
router.get('/:id', userController.getUser);

module.exports = router;