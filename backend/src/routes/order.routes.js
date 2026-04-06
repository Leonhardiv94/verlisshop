const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getMyOrders);
router.get('/', authMiddleware, getAllOrders);

module.exports = router;
