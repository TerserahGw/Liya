const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/private/:userId', messageController.getPrivateMessages);
router.get('/group/:groupId', messageController.getGroupMessages);
router.post('/', messageController.sendMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;