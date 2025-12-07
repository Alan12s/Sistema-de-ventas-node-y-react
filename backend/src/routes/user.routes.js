// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/users - Listar todos los usuarios
router.get(
  '/',
  checkPermission('users:view'),
  userController.getAllUsers
);

// GET /api/users/:id - Obtener usuario por ID
router.get(
  '/:id',
  checkPermission('users:view'),
  userController.getUserById
);

// POST /api/users - Crear nuevo usuario
router.post(
  '/',
  checkPermission('users:create'),
  userController.createUser
);

// PUT /api/users/:id - Actualizar usuario
router.put(
  '/:id',
  checkPermission('users:update'),
  userController.updateUser
);

// PUT /api/users/:id/password - Cambiar contraseña
router.put(
  '/:id/password',
  checkPermission('users:update'),
  userController.changePassword
);

// DELETE /api/users/:id - Desactivar usuario
router.delete(
  '/:id',
  checkPermission('users:delete'),
  userController.deleteUser
);

module.exports = router;