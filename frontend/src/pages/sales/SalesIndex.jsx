// frontend/src/pages/sales/SalesIndex.jsx
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiEye, FiXCircle, FiCalendar, FiDollarSign, FiX, FiUser, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getSales, getSaleById, cancelSale } from '../../services/api';
import useAuthStore from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';

const SalesIndex = () => {
  const { user } = useAuthStore();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSales = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getSales({ page, limit: 10 });
      setSales(response.data.sales);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleViewDetails = async (saleId) => {
    try {
      const response = await getSaleById(saleId);
      setSelectedSale(response.data.sale);
      setShowModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la venta');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Estás seguro de anular esta venta?')) return;
    try {
      await cancelSale(id);
      toast.success('Venta anulada correctamente');
      fetchSales(pagination.page);
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al anular venta');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      COMPLETADA: 'bg-green-100 text-green-800',
      ANULADA: 'bg-red-100 text-red-800',
      PENDIENTE: 'bg-yellow-100 text-yellow-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const getPaymentMethodBadge = (method) => {
    const styles = {
      EFECTIVO: 'bg-green-100 text-green-800',
      TARJETA: 'bg-blue-100 text-blue-800',
      TRANSFERENCIA: 'bg-purple-100 text-purple-800',
      OTRO: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[method]}`}>{method}</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
            <p className="text-gray-500 mt-1">Gestiona todas las ventas registradas</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg"><FiShoppingCart className="text-blue-600 text-xl" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Ventas</p>
                <p className="text-xl font-bold">{pagination.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay ventas registradas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Venta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{sale.saleNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(sale.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{sale.user?.fullName || '-'}</td>
                      <td className="px-6 py-4 font-medium text-green-600">${parseFloat(sale.total).toFixed(2)}</td>
                      <td className="px-6 py-4">{getStatusBadge(sale.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleViewDetails(sale.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" 
                            title="Ver detalle"
                          >
                            <FiEye />
                          </button>
                          {user?.role === 'ADMIN' && sale.status === 'COMPLETADA' && (
                            <button 
                              onClick={() => handleCancel(sale.id)} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg" 
                              title="Anular"
                            >
                              <FiXCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">Página {pagination.page} de {pagination.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => fetchSales(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
                <button onClick={() => fetchSales(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Detalle de Venta</h3>
                  <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200">
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                {/* Información general */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Número de Venta</p>
                    <p className="font-bold text-lg">{selectedSale.saleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className="mt-1">{getStatusBadge(selectedSale.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de Pago</p>
                    <p className="mt-1">{getPaymentMethodBadge(selectedSale.paymentMethod)}</p>
                  </div>
                </div>

                {/* Vendedor y Cliente */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <FiUser className="text-blue-600 text-xl mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Vendedor</p>
                      <p className="font-medium">{selectedSale.user?.fullName || '-'}</p>
                      <p className="text-xs text-gray-500">{selectedSale.user?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <FiUser className="text-green-600 text-xl mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-medium">{selectedSale.customerName || 'Cliente General'}</p>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Productos</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cant.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedSale.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-right">${parseFloat(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totales */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${parseFloat(selectedSale.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA (21%):</span>
                    <span className="font-medium">${parseFloat(selectedSale.tax).toFixed(2)}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-medium text-red-600">-${parseFloat(selectedSale.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${parseFloat(selectedSale.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                {user?.role === 'ADMIN' && selectedSale.status === 'COMPLETADA' && (
                  <button
                    onClick={() => handleCancel(selectedSale.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Anular Venta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SalesIndex;