// backend/src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/categories
 * Obtener todas las categorías
 * Permisos: categories:view
 */
router.get(
  '/',
  checkPermission('categories:view'),
  categoryController.getAllCategories
);

/**
 * GET /api/categories/:id
 * Obtener una categoría por ID
 * Permisos: categories:view
 */
router.get(
  '/:id',
  checkPermission('categories:view'),
  categoryController.getCategoryById
);

/**
 * POST /api/categories
 * Crear una nueva categoría
 * Permisos: categories:create (solo ADMIN)
 */
router.post(
  '/',
  checkPermission('categories:create'),
  categoryController.createCategory
);

/**
 * PUT /api/categories/:id
 * Actualizar una categoría
 * Permisos: categories:update (solo ADMIN)
 */
router.put(
  '/:id',
  checkPermission('categories:update'),
  categoryController.updateCategory
);

/**
 * DELETE /api/categories/:id
 * Eliminar una categoría
 * Permisos: categories:delete (solo ADMIN)
 */
router.delete(
  '/:id',
  checkPermission('categories:delete'),
  categoryController.deleteCategory
);

module.exports = router;