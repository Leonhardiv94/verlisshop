const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VerlisShop API funcionando correctamente' });
});

module.exports = router;
