// backend/src/models/Permission.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Módulo del sistema (products, sales, users, etc.)'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Acción permitida (view, create, update, delete)'
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'VENDEDOR'),
    allowNull: false,
    comment: 'Rol al que aplica el permiso'
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_enabled',
    comment: 'Si el permiso está activo o no'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción del permiso'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_permissions_role',
      fields: ['role']
    },
    {
      name: 'idx_permissions_module',
      fields: ['module']
    },
    {
      unique: true,
      fields: ['module', 'action', 'role']
    }
  ]
});

module.exports = Permission;