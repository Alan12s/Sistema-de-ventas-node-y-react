// frontend/src/pages/permissions/PermissionsIndex.jsx
import { useState, useEffect } from 'react';
import { FiShield, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import axios from 'axios';

const PermissionsIndex = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/permissions/by-module', {
        params: { role: 'VENDEDOR' },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPermissions(response.data.data.permissions);
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (permissionId, currentState) => {
    try {
      setUpdating(permissionId);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/permissions/${permissionId}`,
        { isEnabled: !currentState },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        toast.success('Permiso actualizado');
        fetchPermissions();
      }
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      toast.error('Error al actualizar permiso');
    } finally {
      setUpdating(null);
    }
  };

  const handleInitializePermissions = async () => {
    if (!confirm('¿Estás seguro de inicializar los permisos? Esto creará los permisos por defecto.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/permissions/initialize',
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        toast.success('Permisos inicializados correctamente');
        fetchPermissions();
      }
    } catch (error) {
      console.error('Error al inicializar permisos:', error);
      toast.error('Error al inicializar permisos');
    }
  };

  const getModuleName = (module) => {
    const names = {
      products: 'Productos',
      categories: 'Categorías',
      sales: 'Ventas',
      reports: 'Reportes'
    };
    return names[module] || module;
  };

  const getActionName = (action) => {
    const names = {
      view: 'Ver',
      create: 'Crear',
      update: 'Editar',
      delete: 'Eliminar',
      cancel: 'Anular',
      viewAll: 'Ver Todos',
      export: 'Exportar'
    };
    return names[action] || action;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando permisos...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiShield className="text-blue-600" />
              Gestión de Permisos
            </h1>
            <p className="text-gray-500 mt-1">
              Configura los permisos para el rol de Vendedor
            </p>
          </div>
          <button
            onClick={handleInitializePermissions}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiRefreshCw />
            Inicializar Permisos
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FiShield className="text-blue-600 text-xl mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Información</h3>
              <p className="text-sm text-blue-700 mt-1">
                Los administradores siempre tienen todos los permisos. Estos ajustes solo afectan al rol de Vendedor.
              </p>
            </div>
          </div>
        </div>

        {/* Permisos por módulo */}
        {Object.keys(permissions).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <FiShield className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay permisos configurados
            </h3>
            <p className="text-gray-500 mb-4">
              Haz clic en "Inicializar Permisos" para crear la configuración por defecto
            </p>
            <button
              onClick={handleInitializePermissions}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiRefreshCw />
              Inicializar Permisos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(permissions).map(([module, perms]) => (
              <div key={module} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Header del módulo */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">
                    {getModuleName(module)}
                  </h3>
                </div>

                {/* Lista de permisos */}
                <div className="p-6 space-y-4">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {getActionName(perm.action)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {perm.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleTogglePermission(perm.id, perm.isEnabled)}
                        disabled={updating === perm.id}
                        className={`
                          relative inline-flex items-center h-8 w-14 rounded-full transition-colors
                          ${perm.isEnabled ? 'bg-green-500' : 'bg-gray-300'}
                          ${updating === perm.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span
                          className={`
                            inline-block w-6 h-6 transform rounded-full bg-white shadow-lg transition-transform
                            ${perm.isEnabled ? 'translate-x-7' : 'translate-x-1'}
                          `}
                        >
                          {perm.isEnabled ? (
                            <FiCheck className="text-green-600 w-full h-full p-1" />
                          ) : (
                            <FiX className="text-gray-400 w-full h-full p-1" />
                          )}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PermissionsIndex;