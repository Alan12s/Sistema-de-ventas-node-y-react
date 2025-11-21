// backend/src/controllers/productController.js
const { Product, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los productos
 */
const getAllProducts = async (req, res) => {
  try {
    const { 
      search = '', 
      categoryId, 
      isActive, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Construir filtros
    const where = {};
    
    // Búsqueda por nombre, barcode o SKU
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtrar por categoría
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtrar por estado activo/inactivo
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Paginación
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

/**
 * Obtener un producto por ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Error en getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
};

/**
 * Buscar producto por código de barras
 */
const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const product = await Product.findOne({
      where: { barcode },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Error en getProductByBarcode:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar el producto',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo producto
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      barcode,
      sku,
      price,
      cost,
      stock,
      minStock,
      imageUrl,
      categoryId,
      isActive
    } = req.body;

    // Validaciones
    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio y stock son obligatorios'
      });
    }

    // Verificar si el código de barras ya existe
    if (barcode) {
      const existingBarcode = await Product.findOne({ where: { barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'El código de barras ya está registrado'
        });
      }
    }

    // Verificar si el SKU ya existe
    if (sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'El SKU ya está registrado'
        });
      }
    }

    // Crear el producto
    const product = await Product.create({
      name,
      description,
      barcode,
      sku,
      price,
      cost: cost || 0,
      stock,
      minStock: minStock || 5,
      imageUrl,
      categoryId,
      isActive: isActive !== undefined ? isActive : true
    });

    // Obtener el producto con la categoría
    const productWithCategory = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: productWithCategory }
    });

  } catch (error) {
    console.error('Error en createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message
    });
  }
};

/**
 * Actualizar un producto
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      barcode,
      sku,
      price,
      cost,
      stock,
      minStock,
      imageUrl,
      categoryId,
      isActive
    } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar código de barras si cambió
    if (barcode && barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ 
        where: { 
          barcode,
          id: { [Op.ne]: id }
        } 
      });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'El código de barras ya está registrado'
        });
      }
    }

    // Verificar SKU si cambió
    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ 
        where: { 
          sku,
          id: { [Op.ne]: id }
        } 
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'El SKU ya está registrado'
        });
      }
    }

    // Actualizar el producto
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      barcode: barcode !== undefined ? barcode : product.barcode,
      sku: sku !== undefined ? sku : product.sku,
      price: price !== undefined ? price : product.price,
      cost: cost !== undefined ? cost : product.cost,
      stock: stock !== undefined ? stock : product.stock,
      minStock: minStock !== undefined ? minStock : product.minStock,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      isActive: isActive !== undefined ? isActive : product.isActive
    });

    // Obtener el producto actualizado con la categoría
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Error en updateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
};

/**
 * Eliminar un producto
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
};

/**
 * Obtener productos con stock bajo
 */
const getLowStockProducts = async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    
    const products = await Product.findAll({
      where: sequelize.where(
        sequelize.col('stock'),
        Op.lte,
        sequelize.col('min_stock')
      ),
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['stock', 'ASC']]
    });

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Error en getLowStockProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con stock bajo',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};