// backend/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARES =====

// CORS - Configuración permisiva para desarrollo
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser - Para leer JSON en las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// ===== RUTAS =====
const routes = require('./routes');
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Ventas API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      register: 'POST /api/auth/register',
      products: 'GET /api/products'
    }
  });
});

// ===== MANEJO DE ERRORES =====

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error general
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;