const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:id', groupController.getGroup);
router.put('/:id', groupController.updateGroup);
router.post('/:id/join', groupController.joinGroup);
router.post('/:id/leave', groupController.leaveGroup);
router.post('/:id/roles', groupController.createRole);
router.put('/:id/roles/:roleId', groupController.updateRole);
router.delete('/:id/roles/:roleId', groupController.deleteRole);
router.post('/:id/rooms', groupController.createRoom);
router.put('/:id/rooms/:roomId', groupController.updateRoom);
router.delete('/:id/rooms/:roomId', groupController.deleteRoom);
router.post('/:id/members/:userId', groupController.addMember);
router.put('/:id/members/:userId', groupController.updateMember);
router.delete('/:id/members/:userId', groupController.removeMember);

module.exports = router;