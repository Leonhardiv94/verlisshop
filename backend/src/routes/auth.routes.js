const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateGeneral, updatePhones, updateCredentials, updateAvatar, addSavedAddress, deleteSavedAddress } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile/general', authMiddleware, updateGeneral);
router.put('/profile/phones', authMiddleware, updatePhones);
router.put('/profile/credentials', authMiddleware, updateCredentials);
router.put('/profile/avatar', authMiddleware, updateAvatar);
router.post('/profile/address', authMiddleware, addSavedAddress);
router.delete('/profile/address/:addressId', authMiddleware, deleteSavedAddress);

module.exports = router;
