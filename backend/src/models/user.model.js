const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: [true, 'Los nombres son obligatorios'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true
  },
  cedula: {
    type: String,
    required: [true, 'La cédula es obligatoria'],
    unique: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un correo válido']
  },
  pais: {
    type: String,
    required: [true, 'El país es obligatorio']
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es obligatoria']
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria']
  },
  telefonoLlamadas: {
    type: String,
    trim: true
  },
  telefonoWhatsapp: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  direccionesGuardadas: [{
    pais: String,
    ciudad: String,
    direccion: String,
    referencia: String
  }],
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    validate: {
      validator: function(value) {
        return /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value);
      },
      message: 'La contraseña debe tener al menos una letra mayúscula y una letra minúscula'
    }
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
