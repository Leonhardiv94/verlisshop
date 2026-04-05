const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Crear producto - Protegido, requiere admin (la verificación de admin está en el controlador pero podemos poner auth aqui)
router.post('/', authMiddleware, productController.createProduct);

// Obtener productos - Público
router.get('/', productController.getProducts);

// Actualizar producto - Protegido
router.put('/:id', authMiddleware, productController.updateProduct);

module.exports = router;
