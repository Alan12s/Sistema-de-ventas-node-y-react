// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');


// Registrar rutas
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;