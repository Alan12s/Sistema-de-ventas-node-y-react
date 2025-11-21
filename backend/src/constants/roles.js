// backend/src/constants/roles.js

// Definición de roles
const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR'
};

// Permisos por módulo
const PERMISSIONS = {
  // Productos
  PRODUCTS: {
    VIEW: 'products:view',           // Ver productos (ambos roles)
    CREATE: 'products:create',       // Crear productos (solo admin)
    UPDATE: 'products:update',       // Editar productos (solo admin)
    DELETE: 'products:delete',       // Eliminar productos (solo admin)
  },
  
  // Ventas
  SALES: {
    VIEW: 'sales:view',              // Ver ventas propias (vendedor) o todas (admin)
    CREATE: 'sales:create',          // Crear ventas (ambos roles)
    VIEW_ALL: 'sales:view_all',      // Ver todas las ventas (solo admin)
    DELETE: 'sales:delete',          // Eliminar ventas (solo admin)
  },
  
  // Usuarios
  USERS: {
    VIEW: 'users:view',              // Ver usuarios (solo admin)
    CREATE: 'users:create',          // Crear usuarios (solo admin)
    UPDATE: 'users:update',          // Editar usuarios (solo admin)
    DELETE: 'users:delete',          // Eliminar usuarios (solo admin)
  },
  
  // Categorías
  CATEGORIES: {
    VIEW: 'categories:view',         // Ver categorías (ambos roles)
    CREATE: 'categories:create',     // Crear categorías (solo admin)
    UPDATE: 'categories:update',     // Editar categorías (solo admin)
    DELETE: 'categories:delete',     // Eliminar categorías (solo admin)
  },
  
  // Reportes
  REPORTS: {
    VIEW_OWN: 'reports:view_own',    // Ver reportes propios (vendedor)
    VIEW_ALL: 'reports:view_all',    // Ver todos los reportes (admin)
    EXPORT: 'reports:export',        // Exportar reportes (solo admin)
  },
  
  // Configuración
  SETTINGS: {
    VIEW: 'settings:view',           // Ver configuración (solo admin)
    UPDATE: 'settings:update',       // Modificar configuración (solo admin)
  }
};

// Mapeo de permisos por rol
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // El admin tiene TODOS los permisos
    PERMISSIONS.PRODUCTS.VIEW,
    PERMISSIONS.PRODUCTS.CREATE,
    PERMISSIONS.PRODUCTS.UPDATE,
    PERMISSIONS.PRODUCTS.DELETE,
    
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.VIEW_ALL,
    PERMISSIONS.SALES.DELETE,
    
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
    
    PERMISSIONS.CATEGORIES.VIEW,
    PERMISSIONS.CATEGORIES.CREATE,
    PERMISSIONS.CATEGORIES.UPDATE,
    PERMISSIONS.CATEGORIES.DELETE,
    
    PERMISSIONS.REPORTS.VIEW_OWN,
    PERMISSIONS.REPORTS.VIEW_ALL,
    PERMISSIONS.REPORTS.EXPORT,
    
    PERMISSIONS.SETTINGS.VIEW,
    PERMISSIONS.SETTINGS.UPDATE,
  ],
  
  [ROLES.VENDEDOR]: [
    // El vendedor tiene permisos limitados
    PERMISSIONS.PRODUCTS.VIEW,        // Solo ver productos
    
    PERMISSIONS.SALES.VIEW,           // Solo ver sus ventas
    PERMISSIONS.SALES.CREATE,         // Puede crear ventas
    
    PERMISSIONS.CATEGORIES.VIEW,      // Solo ver categorías
    
    PERMISSIONS.REPORTS.VIEW_OWN,     // Solo ver sus reportes
  ]
};

// Función para verificar si un rol tiene un permiso
const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

// Función para obtener todos los permisos de un rol
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions
};