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

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
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

exports.deleteProduct = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos requeridos.' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Se requiere la contraseña del administrador para confirmar.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña de administrador incorrecta.' });
    }

    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado permanentemente.' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;
    const user = await User.findById(req.userId);

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const review = {
      user: user._id,
      userName: `${user.nombres} ${user.apellidos}`,
      userAvatar: user.avatar || '',
      rating,
      comment,
      createdAt: new Date()
    };

    product.reviews.push(review);

    // Recalcular promedio
    const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.averageRating = totalRating / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Calificación añadida', product });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir calificación' });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const { productId, reviewId } = req.params;
    const admin = await User.findById(req.userId);

    if (admin.role !== 'admin') return res.status(403).json({ error: 'Solo admins pueden responder' });

    const product = await Product.findById(productId);
    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ error: 'Comentario no encontrado' });

    review.reply = reply;
    review.adminName = admin.nombres;

    await product.save();
    res.json({ message: 'Respuesta guardada', product });
  } catch (error) {
    res.status(500).json({ error: 'Error al responder' });
  }
};
