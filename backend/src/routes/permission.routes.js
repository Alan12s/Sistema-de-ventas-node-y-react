// backend/src/routes/permission.routes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authenticate = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/permissions - Obtener todos los permisos
router.get('/', adminOnly, permissionController.getAllPermissions);

// GET /api/permissions/by-module - Obtener permisos agrupados por módulo
router.get('/by-module', adminOnly, permissionController.getPermissionsByModule);

// GET /api/permissions/check - Verificar permiso específico
router.get('/check', permissionController.checkPermission);

// POST /api/permissions/initialize - Inicializar permisos por defecto
router.post('/initialize', adminOnly, permissionController.initializePermissions);

// PUT /api/permissions/:id - Actualizar un permiso
router.put('/:id', adminOnly, permissionController.updatePermission);

module.exports = router;