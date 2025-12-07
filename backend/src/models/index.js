// backend/src/models/index.js
const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');

// Product - Category (Many to One)
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});

// Sale - User (Many to One)
Sale.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Sale, {
  foreignKey: 'userId',
  as: 'sales'
});

// Sale - SaleItem (One to Many)
Sale.hasMany(SaleItem, {
  foreignKey: 'saleId',
  as: 'items',
  onDelete: 'CASCADE'
});

SaleItem.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale'
});

// SaleItem - Product (Many to One)
SaleItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

Product.hasMany(SaleItem, {
  foreignKey: 'productId',
  as: 'saleItems'
});

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    const message = force 
      ? 'Database synchronized (FORCED - DATA DELETED)' 
      : 'Database synchronized';
    console.log(message);
    return true;
  } catch (error) {
    console.error('Error synchronizing database:', error);
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