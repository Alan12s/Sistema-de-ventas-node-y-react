// backend/src/controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, is_active, search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (role) where.role = role;
    if (is_active !== undefined) where.isActive = is_active === 'true';
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Error getUserById:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuario', error: error.message });
  }
};

// Crear usuario
const createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    console.log('📝 Creando usuario:', { username, email, fullName, role });

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const exists = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] }
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'El usuario o email ya existe' });
    }

    // 🔥 IMPORTANTE: NO hashear manualmente, dejar que el hook lo haga
    const user = await User.create({
      username,
      email,
      password, // El hook beforeCreate hasheará esto automáticamente
      fullName,
      role: role || 'VENDEDOR',
      isActive: true
    });

    console.log('✅ Usuario creado correctamente:', user.id);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado correctamente', 
      data: { user: userResponse } 
    });
  } catch (error) {
    console.error('❌ Error createUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear usuario', 
      error: error.message 
    });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, fullName, role, isActive } = req.body;

    console.log('📝 Actualizando usuario:', id);

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (username || email) {
      const conditions = [];
      if (username) conditions.push({ username });
      if (email) conditions.push({ email });
      
      const exists = await User.findOne({
        where: {
          [Op.or]: conditions,
          id: { [Op.ne]: id }
        }
      });

      if (exists) {
        return res.status(400).json({ success: false, message: 'El usuario o email ya existe' });
      }
    }

    // 🔥 NO actualizar la contraseña aquí, solo los demás campos
    await user.update({
      username: username || user.username,
      email: email || user.email,
      fullName: fullName || user.fullName,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    console.log('✅ Usuario actualizado:', id);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({ 
      success: true, 
      message: 'Usuario actualizado correctamente', 
      data: { user: userResponse } 
    });
  } catch (error) {
    console.error('❌ Error updateUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar usuario', 
      error: error.message 
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    console.log('🔑 Cambiando contraseña del usuario:', id);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 🔥 IMPORTANTE: Actualizar directamente, el hook beforeUpdate hasheará automáticamente
    await user.update({ password: newPassword });

    console.log('✅ Contraseña actualizada para usuario:', id);

    res.json({ 
      success: true, 
      message: 'Contraseña actualizada correctamente' 
    });
  } catch (error) {
    console.error('❌ Error changePassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar contraseña', 
      error: error.message 
    });
  }
};

// Desactivar usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ 
        success: false, 
        message: 'No puedes desactivar tu propia cuenta' 
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    await user.update({ isActive: false });

    console.log('✅ Usuario desactivado:', id);

    res.json({ 
      success: true, 
      message: 'Usuario desactivado correctamente' 
    });
  } catch (error) {
    console.error('❌ Error deleteUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al desactivar usuario', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  deleteUser
};