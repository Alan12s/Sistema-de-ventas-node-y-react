const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const saleRoutes = require('./sale.routes');
const userRoutes = require('./user.routes');
const permissionRoutes = require('./permission.routes');
const reportRoutes = require('./report.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/sales', saleRoutes);
router.use('/users', userRoutes);
router.use('/permissions', permissionRoutes);
router.use('/reports', reportRoutes);  // 🔥 Esta línea debe estar aquí

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;