const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// Agent-only user management / listing endpoint
router.get('/', authenticateToken, authorizeRoles('agent'), userController.getUsers);

module.exports = router;
