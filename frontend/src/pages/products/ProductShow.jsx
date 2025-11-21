// frontend/src/pages/products/ProductShow.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiPackage, FiDollarSign, FiHash, FiLayers, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import axios from 'axios';

const ProductShow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/products/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProduct(response.data.data.product);
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      toast.error('Error al cargar el producto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/products/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Producto eliminado exitosamente');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiLoader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Producto no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const profit = parseFloat(product.price) - parseFloat(product.cost);
  const margin = product.cost > 0 ? (profit / product.cost) * 100 : 0;
  const stockStatus = product.stock <= product.minStock;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/products')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalle del Producto</h1>
              <p className="text-sm text-gray-600 mt-1">Información completa del producto</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/products/edit/${id}`)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información General */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center">
                <FiPackage className="mr-2 h-5 w-5 text-blue-600" />
                Información General
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                  <p className="text-base font-medium text-gray-900">{product.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isActive ? (
                      <>
                        <FiCheckCircle className="mr-1 h-3 w-3" />
                        Activo
                      </>
                    ) : (
                      'Inactivo'
                    )}
                  </span>
                </div>

                {product.description && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                    <p className="text-sm text-gray-700">{product.description}</p>
                  </div>
                )}

                {product.barcode && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Código de Barras</label>
                    <div className="flex items-center space-x-2">
                      <FiHash className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-mono text-gray-900">{product.barcode}</p>
                    </div>
                  </div>
                )}

                {product.sku && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                    <p className="text-sm font-mono text-gray-900">{product.sku}</p>
                  </div>
                )}

                {product.category && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                    <div className="flex items-center space-x-2">
                      <FiLayers className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-gray-900">{product.category.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Precios e Inventario */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center">
                <FiDollarSign className="mr-2 h-5 w-5 text-green-600" />
                Precios e Inventario
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Precio de Venta</label>
                  <p className="text-2xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Costo</label>
                  <p className="text-2xl font-bold text-gray-700">${parseFloat(product.cost).toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock Actual</label>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${stockStatus ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </p>
                    {stockStatus && (
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock Mínimo</label>
                  <p className="text-2xl font-bold text-gray-700">{product.minStock}</p>
                </div>
              </div>

              {/* Utilidad */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-900 mb-1">Utilidad por unidad</p>
                    <p className="text-2xl font-bold text-green-900">${profit.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-green-900 mb-1">Margen</p>
                    <p className="text-2xl font-bold text-green-900">{margin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Alerta de stock bajo */}
              {stockStatus && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Stock bajo</p>
                      <p className="text-xs text-red-700 mt-1">
                        El stock actual está por debajo del mínimo recomendado. Considera reabastecer este producto.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          
          {/* Imagen */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Imagen</h2>
            </div>

            <div className="p-6">
              <div className="w-full aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center h-full"><svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><p class="mt-2 text-sm text-gray-500">Sin imagen</p></div>';
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <FiPackage className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Información Adicional</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ID del Producto</label>
                <p className="text-xs font-mono text-gray-600 break-all">{product.id}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Creado</label>
                <p className="text-sm text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Última Actualización</label>
                <p className="text-sm text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductShow;