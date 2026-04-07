const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getMyOrders);
router.get('/', authMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
