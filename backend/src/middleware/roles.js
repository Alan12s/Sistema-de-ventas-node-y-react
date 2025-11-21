// backend/src/middleware/roles.js
const { ROLES, hasPermission } = require('../constants/roles');

/**
 * Middleware que verifica si el usuario tiene un rol específico
 * @param  {...string} allowedRoles - Roles permitidos
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware que verifica si el usuario tiene un permiso específico
 * @param {string} permission - Permiso requerido
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        requiredPermission: permission
      });
    }

    next();
  };
};

/**
 * Middleware que permite acceso solo al administrador
 */
const adminOnly = checkRole(ROLES.ADMIN);

module.exports = {
  checkRole,
  checkPermission,
  adminOnly
};