const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nombres, apellidos, cedula, fechaNacimiento, correo, pais, ciudad, direccion, password } = req.body;

    // Age validation
    const birthDate = new Date(fechaNacimiento);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      return res.status(400).json({ message: 'Debes ser mayor de edad para registrarte' });
    }

    // Check if user already exists by email or cedula
    const existingUser = await User.findOne({ $or: [{ correo }, { cedula }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo o la cédula ya están registrados' });
    }

    // Create user
    const user = await User.create({ nombres, apellidos, cedula, fechaNacimiento, correo, pais, ciudad, direccion, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Find user by correo
    const user = await User.findOne({ correo });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

const updateGeneral = async (req, res) => {
  try {
    const { pais, ciudad, direccion } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { pais, ciudad, direccion }, { new: true, runValidators: true });
    res.json({ message: 'Información general actualizada', user });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando información general', error: error.message });
  }
};

const updatePhones = async (req, res) => {
  try {
    const { telefonoLlamadas, telefonoWhatsapp } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { telefonoLlamadas, telefonoWhatsapp }, { new: true, runValidators: true });
    res.json({ message: 'Teléfonos de contacto actualizados', user });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando teléfonos', error: error.message });
  }
};

const updateCredentials = async (req, res) => {
  try {
    const { correo, password } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (correo) {
      const existingUser = await User.findOne({ correo, _id: { $ne: req.userId } });
      if (existingUser) return res.status(400).json({ message: 'El correo ya está en uso' });
      user.correo = correo;
    }
    
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();
    res.json({ message: 'Credenciales actualizadas', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error actualizando credenciales', error: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { avatar }, { new: true });
    res.json({ message: 'Avatar actualizado correctamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando avatar', error: error.message });
  }
};

module.exports = { register, login, getProfile, updateGeneral, updatePhones, updateCredentials, updateAvatar };
