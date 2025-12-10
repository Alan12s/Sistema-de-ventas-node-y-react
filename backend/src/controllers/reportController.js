// backend/src/controllers/reportController.js
const { Sale, SaleItem, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas de ventas por rango de fechas
const getSalesStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.created_at = {  // 🔥 CAMBIADO: createdAt → created_at
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Si es vendedor, solo ver sus propias ventas
    if (req.user.role === 'VENDEDOR' || userId) {
      where.userId = userId || req.user.id;
    }

    where.status = 'COMPLETADA';

    const sales = await Sale.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name'] }]
        }
      ],
      order: [['created_at', 'DESC']]  // 🔥 CAMBIADO: createdAt → created_at
    });

    // Calcular estadísticas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const totalTax = sales.reduce((sum, s) => sum + parseFloat(s.tax), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + parseFloat(s.discount), 0);

    // Ventas por método de pago
    const byPaymentMethod = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + parseFloat(sale.total);
      return acc;
    }, {});

    // Productos más vendidos
    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.productName;
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += parseFloat(item.subtotal);
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Ventas por día
    const salesByDay = sales.reduce((acc, sale) => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];  // 🔥 CAMBIADO
      if (!acc[date]) {
        acc[date] = { count: 0, total: 0 };
      }
      acc[date].count++;
      acc[date].total += parseFloat(sale.total);
      return acc;
    }, {});

    const dailySales = Object.entries(salesByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalRevenue,
          totalTax,
          totalDiscount,
          averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0
        },
        byPaymentMethod,
        topProducts,
        dailySales,
        sales
      }
    });
  } catch (error) {
    console.error('Error getSalesStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

// Obtener datos para gráficos
const getChartsData = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const where = {
      created_at: { [Op.gte]: startDate },  // 🔥 CAMBIADO: createdAt → created_at
      status: 'COMPLETADA'
    };

    if (req.user.role === 'VENDEDOR') {
      where.userId = req.user.id;
    }

    const sales = await Sale.findAll({
      where,
      include: [{ model: SaleItem, as: 'items' }]
    });

    // Ventas por día
    const salesByDay = {};
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      salesByDay[dateStr] = { count: 0, total: 0 };
    }

    sales.forEach(sale => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];  // 🔥 CAMBIADO
      if (salesByDay[date]) {
        salesByDay[date].count++;
        salesByDay[date].total += parseFloat(sale.total);
      }
    });

    const chartData = Object.entries(salesByDay)
      .map(([date, data]) => ({
        date,
        ventas: data.count,
        ingresos: parseFloat(data.total.toFixed(2))
      }))
      .reverse();

    res.json({
      success: true,
      data: { chartData }
    });
  } catch (error) {
    console.error('Error getChartsData:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener datos para gráficos',
      error: error.message 
    });
  }
};

module.exports = {
  getSalesStats,
  getChartsData
};