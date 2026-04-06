const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const createOrder = async (req, res) => {
  try {
    const { productId, tallaEscogida, cantidad, direccionEnvio, costoEnvio, totalPagar } = req.body;
    
    // Validar producto
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Generar código de orden nativo (P ej: VSH-8A2F9)
    const shortCode = 'VSH-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const order = new Order({
      user: req.userId,
      product: productId,
      productSnapshot: {
        nombre: product.nombre,
        fotoPrincipal: product.fotoPrincipal,
        precio: product.precio,
        codigo: product.codigo
      },
      tallaEscogida,
      cantidad,
      direccionEnvio,
      costoEnvio,
      totalPagar,
      codigoOrden: shortCode
    });

    await order.save();

    res.status(201).json({
      message: 'Compra creada exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error procesando la orden', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    // Sort by newest first
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo historial', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos requeridos.' });
    }

    // Poblamos el user para el panel admin
    const orders = await Order.find().populate('user', 'nombres apellidos correo avatar').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo historial general', error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders };
