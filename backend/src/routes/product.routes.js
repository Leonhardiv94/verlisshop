const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Crear producto - Protegido, requiere admin (la verificación de admin está en el controlador pero podemos poner auth aqui)
router.post('/', authMiddleware, productController.createProduct);

// Obtener productos - Público
router.get('/', productController.getProducts);

// Obtener un solo producto - Público
router.get('/:id', productController.getProductById);

// Actualizar producto - Protegido
router.put('/:id', authMiddleware, productController.updateProduct);

// Eliminar producto - Protegido
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Calificaciones
router.post('/:id/review', authMiddleware, productController.addReview);
router.put('/:productId/review/:reviewId', authMiddleware, productController.updateReview);
router.post('/:productId/reply/:reviewId', authMiddleware, productController.replyReview);

module.exports = router;
