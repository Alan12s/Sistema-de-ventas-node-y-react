// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

// POST /api/auth/login - Login público
router.post('/login', authController.login);

// GET /api/auth/profile - Obtener perfil (requiere autenticación)
router.get('/profile', authMiddleware, authController.getProfile);

// POST /api/auth/register - Registrar usuario (solo admin)
router.post('/register', authMiddleware, adminOnly, authController.register);

module.exports = router;