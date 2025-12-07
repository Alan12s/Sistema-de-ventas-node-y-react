const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');   // <-- CORREGIDO
const { checkPermission } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/categories
 */
router.get(
  '/',
  checkPermission('categories:view'),
  categoryController.getAllCategories
);

/**
 * GET /api/categories/:id
 */
router.get(
  '/:id',
  checkPermission('categories:view'),
  categoryController.getCategoryById
);

/**
 * POST /api/categories
 */
router.post(
  '/',
  checkPermission('categories:create'),
  categoryController.createCategory
);

/**
 * PUT /api/categories/:id
 */
router.put(
  '/:id',
  checkPermission('categories:update'),
  categoryController.updateCategory
);

/**
 * DELETE /api/categories/:id
 */
router.delete(
  '/:id',
  checkPermission('categories:delete'),
  categoryController.deleteCategory
);

module.exports = router;
