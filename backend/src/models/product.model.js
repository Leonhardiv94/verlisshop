const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  codigo: {
    type: Number,
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  subcategoria: {
    type: String,
    required: true
  },
  genero: {
    type: String
  },
  material: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  fotoPrincipal: {
    type: String,
    required: true
  },
  fotosAdicionales: {
    type: [String],
    default: []
  },
  tallas: {
    type: [String],
    default: []
  },
  inventario: [{
    talla: String,
    cantidad: { type: Number, default: 0 }
  }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    userAvatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reply: { type: String, default: '' },
    adminName: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
