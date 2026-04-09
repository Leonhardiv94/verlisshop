const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const createOrder = async (req, res) => {
  try {
    const { items, direccionEnvio, costoEnvio, totalPagar } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'La orden debe tener al menos un producto' });
    }

    // Prepare processed items (snapshots)
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto ${item.productId} no encontrado` });
      }
      processedItems.push({
        product: product._id,
        nombre: product.nombre,
        fotoPrincipal: product.fotoPrincipal,
        precio: product.precio,
        codigo: product.codigo,
        tallaEscogida: item.tallaEscogida || item.size,
        cantidad: item.cantidad
      });

      // --- Descontar Inventario ---
      const tallaEscogida = item.tallaEscogida || item.size;
      if (product.inventario && product.inventario.length > 0) {
        const invItem = product.inventario.find(i => i.talla === tallaEscogida);
        if (invItem) {
          invItem.cantidad = Math.max(0, invItem.cantidad - item.cantidad);
          // Marcar el array como modificado para que Mongoose guarde los cambios en el subdocumento
          product.markModified('inventario');
          await product.save();
        }
      }

    }

    // Generar código de orden nativo
    const shortCode = 'VSH-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const order = new Order({
      user: req.userId,
      items: processedItems,
      direccionEnvio,
      costoEnvio,
      totalPagar,
      codigoOrden: shortCode,
      historialEstados: [{ estado: 'Pedido recibido' }]
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
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    
    // Normalize legacy orders for the new UI
    const normalized = orders.map(order => {
      const obj = order.toObject();
      if (!obj.items || obj.items.length === 0) {
        obj.items = [{
          product: obj.product,
          nombre: obj.productSnapshot?.nombre,
          fotoPrincipal: obj.productSnapshot?.fotoPrincipal,
          precio: obj.productSnapshot?.precio,
          codigo: obj.productSnapshot?.codigo,
          tallaEscogida: obj.tallaEscogida,
          cantidad: obj.cantidad
        }];
      }
      return obj;
    });

    res.json(normalized);
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

    const orders = await Order.find().populate('user', 'nombres apellidos correo avatar').sort({ createdAt: -1 });
    
    // Normalize legacy orders for the new UI
    const normalized = orders.map(order => {
      const obj = order.toObject();
      if (!obj.items || obj.items.length === 0) {
        obj.items = [{
          product: obj.product,
          nombre: obj.productSnapshot?.nombre,
          fotoPrincipal: obj.productSnapshot?.fotoPrincipal,
          precio: obj.productSnapshot?.precio,
          codigo: obj.productSnapshot?.codigo,
          tallaEscogida: obj.tallaEscogida,
          cantidad: obj.cantidad
        }];
      }
      return obj;
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo historial general', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos requeridos.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    order.estado = status;
    order.historialEstados.push({ estado: status, fecha: new Date() });
    await order.save();
    
    const updatedOrder = await Order.findById(id).populate('user', 'nombres apellidos correo avatar');
    
    // Normalize for response
    const obj = updatedOrder.toObject();
    if (!obj.items || obj.items.length === 0) {
      obj.items = [{
        product: obj.product,
        nombre: obj.productSnapshot?.nombre,
        fotoPrincipal: obj.productSnapshot?.fotoPrincipal,
        precio: obj.productSnapshot?.precio,
        codigo: obj.productSnapshot?.codigo,
        tallaEscogida: obj.tallaEscogida,
        cantidad: obj.cantidad
      }];
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando estado', error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
