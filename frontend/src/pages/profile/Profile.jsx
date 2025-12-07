// frontend/src/pages/profile/Profile.jsx
import { useState } from 'react';
import { FiUser, FiMail, FiShield, FiKey, FiSave, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';
import { changePassword, getProfile } from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.id, passwordData.newPassword);
      toast.success('Contraseña actualizada correctamente');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setIsEditingPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      const response = await getProfile();
      updateUser(response.data.user);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const getRoleBadge = () => {
    return user?.role === 'ADMIN' 
      ? { color: 'bg-purple-100 text-purple-800', text: 'Administrador' }
      : { color: 'bg-blue-100 text-blue-800', text: 'Vendedor' };
  };

  const roleInfo = getRoleBadge();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1">Gestiona tu información personal</p>
        </div>

        {/* Tarjeta de información del usuario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Banner superior con degradado */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar y nombre */}
            <div className="flex items-end -mt-16 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
                {user?.fullName?.charAt(0)}
              </div>
              <div className="ml-6 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
                <p className="text-gray-500">@{user?.username}</p>
              </div>
            </div>

            {/* Grid de información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiMail className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Usuario */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUser className="text-green-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Usuario</p>
                  <p className="text-gray-900 font-medium mt-1">{user?.username}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiShield className="text-purple-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Rol del Sistema</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                      {roleInfo.text}
                    </span>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'ADMIN' 
                        ? 'Acceso completo al sistema' 
                        : 'Permisos de vendedor'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permisos */}
            {user?.permissions && user.permissions.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FiShield className="mr-2" />
                  Permisos del Sistema
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.slice(0, 10).map((permission, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                    >
                      {permission.replace(':', ' → ')}
                    </span>
                  ))}
                  {user.permissions.length > 10 && (
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                      +{user.permissions.length - 10} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiKey className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
              </div>
            </div>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FiEdit2 />
                Editar
              </button>
            )}
          </div>

          {isEditingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Repite la contraseña"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FiSave />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500">
              Tu contraseña está protegida. Haz clic en "Editar" para cambiarla.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;