// frontend/src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiPackage, FiLogOut, FiMenu, FiX, FiChevronDown, FiShoppingCart, FiUsers, FiDollarSign, FiUser, FiSettings } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: FiHome, 
      path: '/dashboard', 
      roles: ['ADMIN', 'VENDEDOR'] 
    },
    { 
      name: 'Punto de Venta', 
      icon: FiShoppingCart, 
      path: '/pos', 
      roles: ['ADMIN', 'VENDEDOR'] 
    },
    {
      name: 'Productos',
      icon: FiPackage,
      roles: ['ADMIN', 'VENDEDOR'],
      children: [
        { name: 'Listado', path: '/products' },
        { name: 'Categorías', path: '/categories' }
      ]
    },
    {
      name: 'Ventas',
      icon: FiDollarSign,
      roles: ['ADMIN', 'VENDEDOR'],
      children: [
        { name: 'Historial', path: '/sales' }
      ]
    },
    { 
      name: 'Usuarios', 
      icon: FiUsers, 
      path: '/users', 
      roles: ['ADMIN'] 
    }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-100"
      >
        {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
      </button>

      {/* Overlay móvil */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen 
        bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 
        text-white transition-transform duration-300 ease-in-out z-40 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        w-64 flex flex-col
      `}>
        
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">TECHNOFUTURE</h1>
              <p className="text-xs text-blue-200">Sistema de Ventas</p>
            </div>
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenu.map((item, index) => {
              const Icon = item.icon;
              
              // Si tiene hijos (submenú)
              if (item.children) {
                return (
                  <li key={index}>
                    <button 
                      onClick={() => toggleSubMenu(item.name)} 
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="text-xl" />
                        <span>{item.name}</span>
                      </div>
                      <FiChevronDown className={`transition-transform ${openSubMenu === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Submenú */}
                    {openSubMenu === item.name && (
                      <ul className="pl-12 mt-1 space-y-1">
                        {item.children.map((sub, i) => (
                          <li key={i}>
                            <NavLink 
                              to={sub.path} 
                              onClick={() => setIsOpen(false)} 
                              className={({ isActive }) => `
                                block px-3 py-2 rounded-md text-sm transition-all 
                                ${isActive 
                                  ? 'bg-white text-blue-900 font-medium shadow' 
                                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }
                              `}
                            >
                              {sub.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              
              // Menú simple (sin hijos)
              return (
                <li key={index}>
                  <NavLink 
                    to={item.path} 
                    onClick={() => setIsOpen(false)} 
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all 
                      ${isActive 
                        ? 'bg-white text-blue-900 font-medium shadow-lg' 
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="text-xl flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuario y Logout - Ahora juntos abajo */}
        <div className="border-t border-white/10">
          {/* Botón de Perfil */}
          <NavLink
            to="/profile"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 mx-4 mt-4 rounded-lg transition-all
              ${isActive 
                ? 'bg-white text-blue-900 font-medium shadow-lg' 
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">{user?.fullName?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-blue-200 truncate">{user?.username}</p>
            </div>
          </NavLink>

          {/* Badge de rol */}
          <div className="px-4 mt-2">
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${user?.role === 'ADMIN' 
                ? 'bg-purple-400/20 text-purple-200' 
                : 'bg-blue-400/20 text-blue-200'
              }
            `}>
              {user?.role}
            </span>
          </div>

          {/* Botón Cerrar Sesión */}
          <div className="p-4">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
            >
              <FiLogOut className="text-xl" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;