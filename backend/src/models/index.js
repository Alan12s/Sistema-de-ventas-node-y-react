// backend/src/models/index.js
const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');

// ===== DEFINIR RELACIONES =====

// Relación: Product - Category (Muchos a Uno)
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});

// Relación: Sale - User (Muchos a Uno)
Sale.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Sale, {
  foreignKey: 'userId',
  as: 'sales'
});

// Relación: Sale - SaleItem (Uno a Muchos)
Sale.hasMany(SaleItem, {
  foreignKey: 'saleId',
  as: 'items',
  onDelete: 'CASCADE'
});

SaleItem.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale'
});

// Relación: SaleItem - Product (Muchos a Uno)
SaleItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

Product.hasMany(SaleItem, {
  foreignKey: 'productId',
  as: 'saleItems'
});

// Función para sincronizar base de datos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`✓ Base de datos sincronizada ${force ? '(FORZADA - DATOS ELIMINADOS)' : ''}`);
    return true;
  } catch (error) {
    console.error('✗ Error al sincronizar base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Sale,
  SaleItem,
  syncDatabase
};