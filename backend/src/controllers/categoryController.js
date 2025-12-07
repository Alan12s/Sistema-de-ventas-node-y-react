// backend/src/controllers/categoryController.js
const { Category, Product } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todas las categorías
 */
const getAllCategories = async (req, res) => {
  try {
    const { search = '', isActive, page = 1, limit = 50 } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: categories } = await Category.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset,
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id'],
        required: false
      }]
    });

    // Mapear para agregar productCount
    const categoriesWithCount = categories.map(cat => {
      const categoryData = cat.toJSON();
      return {
        ...categoryData,
        productCount: categoryData.products?.length || 0,
        products: undefined // No enviar la lista completa
      };
    });

    res.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error en getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

/**
 * Obtener una categoría por ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'stock', 'isActive']
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: { category }
    });

  } catch (error) {
    console.error('Error en getCategoryById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la categoría',
      error: error.message
    });
  }
};

/**
 * Crear una nueva categoría
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    console.log('📝 Creando categoría:', { name, description, isActive });

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }

    // Verificar si ya existe
    const existingCategory = await Category.findOne({ 
      where: { name: { [Op.iLike]: name.trim() } }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || null,
      isActive: isActive !== undefined ? isActive : true
    });

    console.log('✅ Categoría creada:', category.id);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Error en createCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la categoría',
      error: error.message
    });
  }
};

/**
 * Actualizar una categoría
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    console.log('📝 Actualizando categoría:', id);

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar nombre único (si cambió)
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({ 
        where: { 
          name: { [Op.iLike]: name.trim() },
          id: { [Op.ne]: id }
        } 
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    await category.update({
      name: name?.trim() || category.name,
      description: description !== undefined ? (description?.trim() || null) : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    console.log('✅ Categoría actualizada:', id);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Error en updateCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la categoría',
      error: error.message
    });
  }
};

/**
 * Eliminar una categoría
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando categoría:', id);

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si tiene productos asociados
    const productCount = await Product.count({ 
      where: { categoryId: id } 
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${productCount} producto(s) asociados a esta categoría`
      });
    }

    await category.destroy();

    console.log('✅ Categoría eliminada:', id);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};