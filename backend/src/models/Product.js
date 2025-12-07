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
        msg: 'Product name is required'
      },
      len: {
        args: [2, 200],
        msg: 'Name must be between 2 and 200 characters'
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
      msg: 'This barcode is already registered'
    },
    validate: {
      len: {
        args: [0, 100],
        msg: 'Barcode cannot exceed 100 characters'
      }
    }
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: {
      msg: 'This SKU is already in use'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price must be greater than or equal to 0'
      },
      isDecimal: {
        msg: 'Price must be a valid decimal number'
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
        msg: 'Cost must be greater than or equal to 0'
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
        msg: 'Stock cannot be negative'
      },
      isInt: {
        msg: 'Stock must be an integer'
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
        msg: 'Minimum stock cannot be negative'
      }
    }
  },
  imageUrl: {
    type: DataTypes.TEXT, // 🔥 Cambiado de STRING(500) a TEXT para soportar base64
    allowNull: true,
    field: 'image_url',
    validate: {
      // 🔥 Validación personalizada que acepta URLs o deja vacío
      isValidImageUrl(value) {
        if (!value || value.trim() === '') {
          return; // Permitir vacío
        }
        // Permitir URLs que empiecen con http/https o data:image (base64)
        const urlPattern = /^(https?:\/\/|data:image\/)/i;
        if (!urlPattern.test(value)) {
          throw new Error('Must be a valid URL or base64 image');
        }
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
  underscored: true,
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