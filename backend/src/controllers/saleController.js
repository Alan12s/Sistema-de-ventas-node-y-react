// backend/src/controllers/saleController.js
const { Sale, SaleItem, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const getAllSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      payment_method,
      start_date,
      end_date,
      user_id
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (payment_method) where.paymentMethod = payment_method;
    if (user_id) where.userId = user_id;

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const { count, rows: sales } = await Sale.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] },
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getAllSales:', error);
    res.status(500).json({ success: false, message: 'Error retrieving sales', error: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] },
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    res.json({ success: true, data: { sale } });
  } catch (error) {
    console.error('Error getSaleById:', error);
    res.status(500).json({ success: false, message: 'Error retrieving sale', error: error.message });
  }
};

const createSale = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items, paymentMethod, customerName, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Sale must have at least one product' });
    }

    const lastSale = await Sale.findOne({ 
      order: [['created_at', 'DESC']],
      transaction: t 
    });
    
    const saleNumber = `VTA-${String((lastSale ? parseInt(lastSale.saleNumber.split('-')[1]) + 1 : 1)).padStart(6, '0')}`;

    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal
      });

      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }

    const tax = subtotal * 0.21;
    const total = subtotal + tax - discount;

    const sale = await Sale.create({
      saleNumber,
      userId: req.user.id,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      customerName,
      status: 'COMPLETADA'
    }, { transaction: t });

    for (const item of saleItems) {
      await SaleItem.create({ ...item, saleId: sale.id }, { transaction: t });
    }

    await t.commit();

    const saleWithItems = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] },
        { model: SaleItem, as: 'items' }
      ]
    });

    res.status(201).json({ success: true, message: 'Sale registered successfully', data: { sale: saleWithItems } });
  } catch (error) {
    await t.rollback();
    console.error('Error createSale:', error);
    res.status(500).json({ success: false, message: 'Error creating sale', error: error.message });
  }
};

const cancelSale = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id, { include: [{ model: SaleItem, as: 'items' }] });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    if (sale.status === 'ANULADA') {
      return res.status(400).json({ success: false, message: 'Sale is already cancelled' });
    }

    for (const item of sale.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        await product.update({ stock: product.stock + item.quantity }, { transaction: t });
      }
    }

    await sale.update({ status: 'ANULADA' }, { transaction: t });
    await t.commit();

    res.json({ success: true, message: 'Sale cancelled successfully', data: { sale } });
  } catch (error) {
    await t.rollback();
    console.error('Error cancelSale:', error);
    res.status(500).json({ success: false, message: 'Error cancelling sale', error: error.message });
  }
};

const getTodaySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sale.findAll({
      where: {
        created_at: { [Op.gte]: today },
        status: 'COMPLETADA'
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName'] }],
      order: [['created_at', 'DESC']]
    });

    const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.total), 0);

    res.json({
      success: true,
      data: { sales, count: sales.length, totalSales }
    });
  } catch (error) {
    console.error('Error getTodaySales:', error);
    res.status(500).json({ success: false, message: 'Error retrieving today sales', error: error.message });
  }
};

module.exports = { getAllSales, getSaleById, createSale, cancelSale, getTodaySales };