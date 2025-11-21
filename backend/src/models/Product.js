// backend/src/models/Product.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del producto es requerido'
      },
      len: {
        args: [2, 200],
        msg: 'El nombre debe tener entre 2 y 200 caracteres'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: {
      msg: 'Este código de barras ya está registrado'
    },
    validate: {
      len: {
        args: [0, 100],
        msg: 'El código de barras no puede exceder 100 caracteres'
      }
    }
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: {
      msg: 'Este SKU ya está en uso'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El precio debe ser mayor o igual a 0'
      },
      isDecimal: {
        msg: 'El precio debe ser un número decimal válido'
      }
    },
    get() {
      const value = this.getDataValue('price');
      return value ? parseFloat(value) : 0;
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El costo debe ser mayor o igual a 0'
      }
    },
    get() {
      const value = this.getDataValue('cost');
      return value ? parseFloat(value) : 0;
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El stock no puede ser negativo'
      },
      isInt: {
        msg: 'El stock debe ser un número entero'
      }
    }
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5,
    field: 'min_stock',
    validate: {
      min: {
        args: [0],
        msg: 'El stock mínimo no puede ser negativo'
      }
    }
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url',
    validate: {
      isUrl: {
        msg: 'Debe ser una URL válida'
      }
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true, // CRÍTICO: Esto convierte automáticamente createdAt -> created_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_products_barcode',
      fields: ['barcode']
    },
    {
      name: 'idx_products_category',
      fields: ['category_id']
    },
    {
      name: 'idx_products_name',
      fields: ['name']
    }
  ]
});

module.exports = Product;