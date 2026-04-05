const Product = require('../models/product.model');
const User = require('../models/user.model');

exports.createProduct = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    // Solo permitimos admins
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos de administrador requeridos.' });
    }

    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json({ message: 'Producto creado exitosamente', product: savedProduct });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { categoria, subcategoria } = req.query;
    
    // Construir filtro basado en parámetros
    let filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (subcategoria) filtro.subcategoria = subcategoria;

    // Ordenar de más reciente a más viejo
    const products = await Product.find(filtro).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};
