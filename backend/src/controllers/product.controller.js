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
    const { categoria, subcategoria, search } = req.query;
    
    // Construir filtro basado en parámetros
    let filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (subcategoria) filtro.subcategoria = subcategoria;

    if (search) {
      if (!isNaN(search)) {
         filtro.$or = [
           { codigo: Number(search) },
           { nombre: { $regex: search, $options: 'i' } }
         ];
      } else {
         filtro.$or = [
           { nombre: { $regex: search, $options: 'i' } },
           { categoria: { $regex: search, $options: 'i' } },
           { subcategoria: { $regex: search, $options: 'i' } }
         ];
      }
    }
    if (subcategoria) filtro.subcategoria = subcategoria;

    // Ordenar de más reciente a más viejo
    const products = await Product.find(filtro).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos requeridos.' });
    }

    const { id } = req.params;
    
    // Solo extraemos los campos que permitimos actualizar
    const { precio, descripcion, tallas, fotoPrincipal, fotosAdicionales } = req.body;
    
    const updateData = {};
    if (precio !== undefined) updateData.precio = precio;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (tallas !== undefined) updateData.tallas = tallas;
    if (fotoPrincipal !== undefined) updateData.fotoPrincipal = fotoPrincipal;
    if (fotosAdicionales !== undefined) updateData.fotosAdicionales = fotosAdicionales;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};
