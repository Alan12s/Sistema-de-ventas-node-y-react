// backend/src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');
const { PERMISSIONS } = require('../constants/roles');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos (con filtros y búsqueda)
 * @access  Private (ADMIN y VENDEDOR pueden ver)
 */
router.get('/', 
  checkPermission(PERMISSIONS.PRODUCTS.VIEW),
  productController.getAllProducts
);

/**
 * @route   GET /api/products/low-stock
 * @desc    Obtener productos con stock bajo
 * @access  Private (ADMIN y VENDEDOR)
 */
router.get('/low-stock',
  checkPermission(PERMISSIONS.PRODUCTS.VIEW),
  productController.getLowStockProducts
);

/**
 * @route   GET /api/products/barcode/:barcode
 * @desc    Buscar producto por código de barras
 * @access  Private (ADMIN y VENDEDOR)
 */
router.get('/barcode/:barcode',
  checkPermission(PERMISSIONS.PRODUCTS.VIEW),
  productController.getProductByBarcode
);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener un producto por ID
 * @access  Private (ADMIN y VENDEDOR)
 */
router.get('/:id',
  checkPermission(PERMISSIONS.PRODUCTS.VIEW),
  productController.getProductById
);

/**
 * @route   POST /api/products
 * @desc    Crear un nuevo producto
 * @access  Private (Solo ADMIN)
 */
router.post('/',
  checkPermission(PERMISSIONS.PRODUCTS.CREATE),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar un producto
 * @access  Private (Solo ADMIN)
 */
router.put('/:id',
  checkPermission(PERMISSIONS.PRODUCTS.UPDATE),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar un producto
 * @access  Private (Solo ADMIN)
 */
router.delete('/:id',
  checkPermission(PERMISSIONS.PRODUCTS.DELETE),
  productController.deleteProduct
);

module.exports = router;