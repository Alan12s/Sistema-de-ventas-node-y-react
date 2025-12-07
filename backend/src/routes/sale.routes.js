const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authenticate = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');

router.use(authenticate);

router.get('/', checkPermission('sales:view'), saleController.getAllSales);
router.get('/today', checkPermission('sales:view'), saleController.getTodaySales);
router.get('/:id', checkPermission('sales:view'), saleController.getSaleById);
router.post('/', checkPermission('sales:create'), saleController.createSale);
router.put('/:id/cancel', checkPermission('sales:delete'), saleController.cancelSale);

module.exports = router;