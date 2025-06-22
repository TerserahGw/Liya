const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/', friendController.getFriends);
router.post('/request', friendController.sendFriendRequest);
router.get('/requests', friendController.getFriendRequests);
router.put('/requests/:id', friendController.respondToFriendRequest);
router.delete('/:id', friendController.removeFriend);

module.exports = router;