// backend/src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// GET /api/reports/sales-stats - Estadísticas de ventas
router.get('/sales-stats', reportController.getSalesStats);

// GET /api/reports/charts-data - Datos para gráficos
router.get('/charts-data', reportController.getChartsData);

module.exports = router;