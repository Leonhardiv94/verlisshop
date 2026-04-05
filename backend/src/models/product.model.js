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
    // Genero implicito o definido
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
    type: [String], // "19", "21", "23", "36", etc.
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
