// backend/src/models/Sale.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  saleNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'sale_number'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El subtotal debe ser mayor o igual a 0'
      }
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El impuesto debe ser mayor o igual a 0'
      }
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El descuento debe ser mayor o igual a 0'
      }
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El total debe ser mayor o igual a 0'
      }
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'),
    allowNull: false,
    defaultValue: 'EFECTIVO',
    field: 'payment_method'
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'customer_name'
  },
  customerDocument: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'customer_document'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('COMPLETADA', 'CANCELADA', 'PENDIENTE'),
    allowNull: false,
    defaultValue: 'COMPLETADA'
  }
}, {
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_sales_user',
      fields: ['user_id']
    },
    {
      name: 'idx_sales_created',
      fields: ['created_at']
    },
    {
      name: 'idx_sales_number',
      fields: ['sale_number']
    }
  ]
});

module.exports = Sale;