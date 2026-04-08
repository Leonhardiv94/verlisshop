const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// List users with intelligent search (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};

    if (query) {
      filter = {
        $or: [
          { nombres: { $regex: query, $options: 'i' } },
          { apellidos: { $regex: query, $options: 'i' } },
          { cedula: { $regex: query, $options: 'i' } },
          { correo: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar usuarios', error: error.message });
  }
};

// Create User (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { nombres, apellidos, cedula, correo, password, role, pais, ciudad, direccion, fechaNacimiento } = req.body;

    const userExists = await User.findOne({ 
      $or: [{ correo }, { cedula }] 
    });

    if (userExists) {
      return res.status(400).json({ message: 'El correo o la cédula ya están registrados' });
    }

    const newUser = new User({
      nombres,
      apellidos,
      cedula,
      correo,
      password,
      role,
      pais: pais || 'Colombia',
      ciudad: ciudad || 'Medellín',
      direccion: direccion || 'Por definir',
      fechaNacimiento: fechaNacimiento || new Date()
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

// Update User (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo, password, role, deleteAvatar } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Update conditional fields
    if (correo) user.correo = correo;
    if (role) user.role = role;
    if (deleteAvatar) user.avatar = '';
    
    // Manual hash if password changes
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};
