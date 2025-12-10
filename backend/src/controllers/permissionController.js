// backend/src/controllers/permissionController.js
const { Permission } = require('../models');

// Estructura de permisos por defecto
const DEFAULT_PERMISSIONS = [
  // PRODUCTOS
  { module: 'products', action: 'view', role: 'VENDEDOR', isEnabled: true, description: 'Ver productos' },
  { module: 'products', action: 'create', role: 'VENDEDOR', isEnabled: false, description: 'Crear productos' },
  { module: 'products', action: 'update', role: 'VENDEDOR', isEnabled: false, description: 'Editar productos' },
  { module: 'products', action: 'delete', role: 'VENDEDOR', isEnabled: false, description: 'Eliminar productos' },
  
  // CATEGORÍAS
  { module: 'categories', action: 'view', role: 'VENDEDOR', isEnabled: true, description: 'Ver categorías' },
  { module: 'categories', action: 'create', role: 'VENDEDOR', isEnabled: false, description: 'Crear categorías' },
  { module: 'categories', action: 'update', role: 'VENDEDOR', isEnabled: false, description: 'Editar categorías' },
  { module: 'categories', action: 'delete', role: 'VENDEDOR', isEnabled: false, description: 'Eliminar categorías' },
  
  // VENTAS
  { module: 'sales', action: 'view', role: 'VENDEDOR', isEnabled: true, description: 'Ver ventas propias' },
  { module: 'sales', action: 'create', role: 'VENDEDOR', isEnabled: true, description: 'Crear ventas' },
  { module: 'sales', action: 'cancel', role: 'VENDEDOR', isEnabled: false, description: 'Anular ventas' },
  { module: 'sales', action: 'viewAll', role: 'VENDEDOR', isEnabled: false, description: 'Ver todas las ventas' },
  
  // REPORTES
  { module: 'reports', action: 'view', role: 'VENDEDOR', isEnabled: true, description: 'Ver reportes propios' },
  { module: 'reports', action: 'viewAll', role: 'VENDEDOR', isEnabled: false, description: 'Ver todos los reportes' },
  { module: 'reports', action: 'export', role: 'VENDEDOR', isEnabled: false, description: 'Exportar reportes' },
];

// Obtener todos los permisos
const getAllPermissions = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    const permissions = await Permission.findAll({
      where,
      order: [['module', 'ASC'], ['action', 'ASC']]
    });

    res.json({
      success: true,
      data: { permissions }
    });
  } catch (error) {
    console.error('❌ Error getAllPermissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener permisos',
      error: error.message 
    });
  }
};

// Actualizar un permiso
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;

    const permission = await Permission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Permiso no encontrado' 
      });
    }

    await permission.update({ isEnabled });

    console.log(`✅ Permiso actualizado: ${permission.module}:${permission.action} para ${permission.role} = ${isEnabled}`);

    res.json({
      success: true,
      message: 'Permiso actualizado correctamente',
      data: { permission }
    });
  } catch (error) {
    console.error('❌ Error updatePermission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar permiso',
      error: error.message 
    });
  }
};

// Verificar si un usuario tiene un permiso específico
const checkPermission = async (req, res) => {
  try {
    const { module, action } = req.query;
    const userRole = req.user.role;

    // Admin siempre tiene todos los permisos
    if (userRole === 'ADMIN') {
      return res.json({
        success: true,
        data: { hasPermission: true }
      });
    }

    const permission = await Permission.findOne({
      where: { module, action, role: userRole }
    });

    const hasPermission = permission ? permission.isEnabled : false;

    res.json({
      success: true,
      data: { hasPermission }
    });
  } catch (error) {
    console.error('❌ Error checkPermission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar permiso',
      error: error.message 
    });
  }
};

// Inicializar permisos por defecto
const initializePermissions = async (req, res) => {
  try {
    console.log('🔧 Inicializando permisos del sistema...');

    for (const perm of DEFAULT_PERMISSIONS) {
      const exists = await Permission.findOne({
        where: {
          module: perm.module,
          action: perm.action,
          role: perm.role
        }
      });

      if (!exists) {
        await Permission.create(perm);
        console.log(`✅ Permiso creado: ${perm.module}:${perm.action} para ${perm.role}`);
      }
    }

    res.json({
      success: true,
      message: 'Permisos inicializados correctamente'
    });
  } catch (error) {
    console.error('❌ Error initializePermissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al inicializar permisos',
      error: error.message 
    });
  }
};

// Obtener permisos por módulo agrupados
const getPermissionsByModule = async (req, res) => {
  try {
    const { role = 'VENDEDOR' } = req.query;

    const permissions = await Permission.findAll({
      where: { role },
      order: [['module', 'ASC'], ['action', 'ASC']]
    });

    // Agrupar por módulo
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { permissions: grouped }
    });
  } catch (error) {
    console.error('❌ Error getPermissionsByModule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener permisos',
      error: error.message 
    });
  }
};

module.exports = {
  getAllPermissions,
  updatePermission,
  checkPermission,
  initializePermissions,
  getPermissionsByModule
};