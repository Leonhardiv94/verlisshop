const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Admin only routes
router.get('/', authMiddleware, getUsers);
router.post('/', authMiddleware, createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
