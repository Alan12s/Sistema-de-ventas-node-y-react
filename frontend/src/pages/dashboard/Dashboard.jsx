// frontend/src/pages/dashboard/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiUsers, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Estadísticas (después conectaremos con la API)
  const stats = [
    {
      title: 'Total Productos',
      value: '0',
      icon: FiPackage,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Ventas Hoy',
      value: '0',
      icon: FiShoppingCart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Ingresos del Día',
      value: '$0.00',
      icon: FiDollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Usuarios Activos',
      value: '1',
      icon: FiUsers,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      adminOnly: true
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600">
          Aquí tienes un resumen de tu negocio
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          if (stat.adminOnly && user?.role !== 'ADMIN') return null;
          
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`text-2xl ${stat.textColor}`} />
                </div>
                {stat.change && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Productos con stock bajo */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FiAlertCircle className="mr-2 text-orange-500" />
              Stock Bajo
            </h2>
            <span className="text-sm text-gray-500">Actualizado ahora</span>
          </div>
          <div className="text-center py-12">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay productos con stock bajo</p>
            <p className="text-sm text-gray-400 mt-2">Los productos aparecerán aquí cuando el stock sea menor al mínimo</p>
          </div>
        </div>

        {/* Últimas ventas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FiTrendingUp className="mr-2 text-green-500" />
              Últimas Ventas
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todas
            </button>
          </div>
          <div className="text-center py-12">
            <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay ventas registradas</p>
            <p className="text-sm text-gray-400 mt-2">Las ventas aparecerán aquí en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Gráfico de ventas (placeholder) */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Ventas de los Últimos 7 Días
        </h2>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-center">
            <FiTrendingUp className="text-6xl text-blue-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Gráfico de ventas</p>
            <p className="text-sm text-gray-500 mt-2">Próximamente con datos reales</p>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-left group">
          <FiPackage className="text-4xl mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-1">Agregar Producto</h3>
          <p className="text-blue-100 text-sm">Registra nuevos productos al inventario</p>
        </button>

        <button className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-left group">
          <FiShoppingCart className="text-4xl mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-1">Nueva Venta</h3>
          <p className="text-green-100 text-sm">Registra una nueva venta</p>
        </button>

        <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-left group">
          <FiTrendingUp className="text-4xl mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-1">Ver Reportes</h3>
          <p className="text-purple-100 text-sm">Analiza tus ventas y estadísticas</p>
        </button>
      </div>
    </MainLayout>
  );
};

export default Dashboard;