// frontend/src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown // ← Necesario para el ícono del desplegable
} from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Controla si el sidebar está abierto en móvil
  const [isOpen, setIsOpen] = useState(false);

  // Controla qué submenú está abierto
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (menuName) => {
    // Alterna el estado: abre o cierra el submenu seleccionado
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  /*
    ============================
    MENÚ PRINCIPAL
    ============================

    Aquí agregamos "children" dentro del ítem Productos.
    Esto crea un menú padre con un submenu interno.
  */
  const menuItems = [
    {
      name: 'Dashboard',
      icon: FiHome,
      path: '/dashboard',
      roles: ['ADMIN', 'VENDEDOR']
    },
    {
      name: 'Productos',
      icon: FiPackage,
      roles: ['ADMIN', 'VENDEDOR'],

      // Submenú dentro de Productos
      children: [
        { name: 'Listado', path: '/products' },
        { name: 'Categorías', path: '/categories' }
      ]
    }
  ];

  // Filtra según el rol del usuario
  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Botón móvil para abrir sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-100"
      >
        {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
      </button>

      {/* Overlay oscuro en móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 text-white
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">ORBIT</h1>
              <p className="text-xs text-blue-200">Sistema de Ventas</p>
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">{user?.fullName?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-blue-200 truncate">{user?.username}</p>
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-400/20 text-purple-200'
                  : 'bg-blue-400/20 text-blue-200'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* ======================== */}
        {/* MENÚ DE NAVEGACIÓN */}
        {/* ======================== */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenu.map((item, index) => {
              const Icon = item.icon;

              // === Caso 1: Ítems con SUBMENÚ ===
              if (item.children) {
                return (
                  <li key={index}>
                    {/* Botón para abrir/cerrar submenu */}
                    <button
                      onClick={() => toggleSubMenu(item.name)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="text-xl" />
                        <span>{item.name}</span>
                      </div>

                      {/* Ícono que rota al abrir */}
                      <FiChevronDown
                        className={`transition-transform ${
                          openSubMenu === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Submenú desplegable */}
                    {openSubMenu === item.name && (
                      <ul className="pl-12 mt-1 space-y-1">
                        {item.children.map((sub, i) => (
                          <li key={i}>
                            <NavLink
                              to={sub.path}
                              onClick={() => setIsOpen(false)}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-sm transition-all ${
                                  isActive
                                    ? 'bg-white text-blue-900 font-medium shadow'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }`
                              }
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

              // === Caso 2: Ítems normales sin submenu ===
              return (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-blue-900 font-medium shadow-lg'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="text-xl flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botón de logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
          >
            <FiLogOut className="text-xl" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
