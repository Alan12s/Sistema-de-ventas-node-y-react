// frontend/src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiUsers, FiDollarSign, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';
import { getProducts, getTodaySales, getUsers, getLowStockProducts } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    todaySales: 0,
    todayRevenue: 0,
    activeUsers: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener productos totales
      const productsRes = await getProducts({ limit: 1 });
      
      // Obtener ventas del día
      const salesRes = await getTodaySales();
      
      // Obtener usuarios activos (solo admin)
      let usersRes = null;
      if (user?.role === 'ADMIN') {
        usersRes = await getUsers({ is_active: true, limit: 1 });
      }
      
      // Obtener productos con stock bajo
      const lowStockRes = await getLowStockProducts();
      
      setStats({
        totalProducts: productsRes.data.pagination.total || 0,
        todaySales: salesRes.data.count || 0,
        todayRevenue: salesRes.data.totalSales || 0,
        activeUsers: usersRes?.data.pagination.total || 0
      });
      
      setLowStockProducts(lowStockRes.data.products || []);
      setRecentSales(salesRes.data.sales.slice(0, 5) || []);
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar algunos datos');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: () => navigate('/products')
    },
    {
      title: 'Ventas Hoy',
      value: stats.todaySales,
      icon: FiShoppingCart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: () => navigate('/sales')
    },
    {
      title: 'Ingresos del Día',
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => navigate('/sales')
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: FiUsers,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      adminOnly: true,
      onClick: () => navigate('/users')
    }
  ];

  //  Botones de acceso rápido según el rol
  const quickActions = user?.role === 'ADMIN' ? [
    {
      title: 'Agregar Producto',
      description: 'Registra nuevos productos al inventario',
      icon: FiPlus,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      onClick: () => navigate('/products/create')
    },
    {
      title: 'Nueva Venta',
      description: 'Registra una nueva venta',
      icon: FiShoppingCart,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      onClick: () => navigate('/pos')
    },
    {
      title: 'Ver Reportes',
      description: 'Analiza tus ventas y estadísticas',
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      onClick: () => navigate('/sales')
    }
  ] : [
    //  Vendedor solo puede: ver productos, hacer ventas y ver sus ventas
    {
      title: 'Ver Productos',
      description: 'Consulta el catálogo de productos',
      icon: FiPackage,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      onClick: () => navigate('/products')
    },
    {
      title: 'Nueva Venta',
      description: 'Registra una nueva venta',
      icon: FiShoppingCart,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      onClick: () => navigate('/pos')
    },
    {
      title: 'Mis Ventas',
      description: 'Consulta el historial de ventas',
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      onClick: () => navigate('/sales')
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          ¡Bienvenido, {user?.fullName}!
        </h1>
        <p className="text-base lg:text-lg text-gray-600">
          {user?.role === 'ADMIN' 
            ? 'Aquí tienes un resumen completo de tu negocio' 
            : 'Aquí tienes un resumen de tus ventas del día'
          }
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          if (stat.adminOnly && user?.role !== 'ADMIN') return null;
          
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 lg:p-8 border border-gray-100 cursor-pointer transform hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-4 rounded-xl transition-transform hover:scale-110`}>
                  <Icon className={`text-3xl ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm lg:text-base font-medium mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stat.value
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Productos con stock bajo */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
              <FiAlertCircle className="mr-3 text-orange-500 text-2xl" />
              Stock Bajo
            </h2>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
              {lowStockProducts.length}
            </span>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-16">
              <FiPackage className="text-7xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">No hay productos con stock bajo</p>
              <p className="text-base text-gray-400 mt-2">Los productos aparecerán aquí cuando el stock sea menor al mínimo</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/show/${product.id}`)}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stock: {product.stock} / Mín: {product.minStock}
                    </p>
                  </div>
                  <span className="ml-3 px-3 py-1.5 bg-orange-200 text-orange-800 text-sm font-semibold rounded-full">
                    {product.stock === 0 ? '¡Agotado!' : '¡Reponer!'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas ventas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
              <FiTrendingUp className="mr-3 text-green-500 text-2xl" />
              {user?.role === 'ADMIN' ? 'Últimas Ventas' : 'Mis Últimas Ventas'}
            </h2>
            <button
              onClick={() => navigate('/sales')}
              className="text-sm lg:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Ver todas
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : recentSales.length === 0 ? (
            <div className="text-center py-16">
              <FiShoppingCart className="text-7xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">No hay ventas registradas hoy</p>
              <p className="text-base text-gray-400 mt-2">Las ventas aparecerán aquí en tiempo real</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900">
                      {sale.saleNumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(sale.createdAt).toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {sale.user?.fullName}
                    </p>
                  </div>
                  <span className="ml-3 text-base font-bold text-green-600">
                    ${parseFloat(sale.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de ventas */}
      <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100 mb-8 animate-fade-in">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Ventas de los Últimos 7 Días
        </h2>
        <div className="h-72 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-center">
            <FiTrendingUp className="text-7xl text-blue-300 mx-auto mb-4 animate-bounce" />
            <p className="text-lg text-gray-600 font-medium">Gráfico de ventas</p>
            <p className="text-base text-gray-500 mt-2">Próximamente con datos reales</p>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-8 ${action.hoverColor} transition-all shadow-lg hover:shadow-xl text-left group transform hover:-translate-y-1`}
            >
              <Icon className="text-5xl mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-2">{action.title}</h3>
              <p className="text-blue-100 text-base">{action.description}</p>
            </button>
          );
        })}
      </div>

      <style>
        {`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }
        `}
      </style>
    </MainLayout>
  );
};

export default Dashboard;