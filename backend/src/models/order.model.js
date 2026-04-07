const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    nombre: String,
    fotoPrincipal: String,
    precio: Number,
    codigo: Number
  },
  tallaEscogida: {
    type: String
  },
  cantidad: {
    type: Number,
    required: true,
    default: 1
  },
  direccionEnvio: {
    pais: String,
    ciudad: String,
    direccion: String,
    referencia: String
  },
  costoEnvio: {
    type: Number,
    default: 0
  },
  totalPagar: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    default: 'Pedido recibido por el vendedor',
    enum: ['Pedido recibido por el vendedor', 'Pedido despachado', 'Pedido entregado', 'Pedido devuelto', 'Pedido cancelado']
  },
  historialEstados: [
    {
      estado: String,
      fecha: { type: Date, default: Date.now }
    }
  ],
  codigoOrden: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
