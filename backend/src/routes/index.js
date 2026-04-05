const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VerlisShop API funcionando correctamente' });
});

module.exports = router;
