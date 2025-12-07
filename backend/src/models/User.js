// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { ROLES } = require('../constants/roles');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'This username is already in use'
    },
    validate: {
      len: {
        args: [3, 50],
        msg: 'Username must be between 3 and 50 characters'
      },
      notEmpty: {
        msg: 'Username is required'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'This email is already registered'
    },
    validate: {
      isEmail: {
        msg: 'Must be a valid email'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      },
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name',
    validate: {
      notEmpty: {
        msg: 'Full name is required'
      }
    }
  },
  role: {
    type: DataTypes.ENUM(ROLES.ADMIN, ROLES.VENDEDOR),
    allowNull: false,
    defaultValue: ROLES.VENDEDOR,
    validate: {
      isIn: {
        args: [[ROLES.ADMIN, ROLES.VENDEDOR]],
        msg: 'Invalid role'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    // 🔥 Hook que se ejecuta ANTES de crear un usuario
    beforeCreate: async (user) => {
      if (user.password) {
        console.log('🔐 Hasheando contraseña en beforeCreate para:', user.username);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('✅ Contraseña hasheada correctamente');
      }
    },
    // 🔥 Hook que se ejecuta ANTES de actualizar un usuario
    beforeUpdate: async (user) => {
      // Solo hashear si la contraseña cambió
      if (user.changed('password')) {
        console.log('🔐 Hasheando contraseña en beforeUpdate para:', user.username);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('✅ Contraseña hasheada correctamente');
      }
    }
  }
});

// Método para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  console.log('🔍 Comparando contraseñas para usuario:', this.username);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('🔍 Resultado de comparación:', isMatch ? '✅ Coincide' : '❌ No coincide');
  return isMatch;
};

// Método para ocultar contraseña en JSON
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;