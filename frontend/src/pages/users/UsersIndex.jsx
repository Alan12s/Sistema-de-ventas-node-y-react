// frontend/src/pages/users/UsersIndex.jsx
import { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiKey } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getUsers, deleteUser, changePassword } from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import UserFormModal from '../../components/users/UserFormModal';

const UsersIndex = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await getUsers({ page, limit: 10, search: searchTerm });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
    try {
      await deleteUser(id);
      toast.success('Usuario desactivado correctamente');
      fetchUsers(pagination.page, search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al desactivar usuario');
    }
  };

  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    setEditingUser(null);
    if (refresh) {
      fetchUsers(pagination.page, search);
    }
  };

  const handleChangePassword = (userId) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await changePassword(passwordUserId, newPassword);
      toast.success('Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setPasswordUserId(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-800',
      VENDEDOR: 'bg-blue-100 text-blue-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>{role}</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 mt-1">Gestiona los usuarios del sistema</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus /> Nuevo Usuario
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Buscar
            </button>
          </form>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Usuarios</p>
              <p className="text-xl font-bold">{pagination.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No se encontraron usuarios</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{u.username}</td>
                      <td className="px-6 py-4">{u.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" 
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => handleChangePassword(u.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg" 
                            title="Cambiar contraseña"
                          >
                            <FiKey />
                          </button>
                          {u.isActive && (
                            <button 
                              onClick={() => handleDelete(u.id)} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg" 
                              title="Desactivar"
                            >
                              <FiTrash2 />
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
                <button 
                  onClick={() => fetchUsers(pagination.page - 1, search)} 
                  disabled={pagination.page === 1} 
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => fetchUsers(pagination.page + 1, search)} 
                  disabled={pagination.page === pagination.totalPages} 
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Usuario */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={handleModalClose}
        />
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowPasswordModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <FiKey className="text-white text-2xl" />
                  <h3 className="text-lg font-semibold text-white">Cambiar Contraseña</h3>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="px-6 py-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">La contraseña debe tener al menos 6 caracteres</p>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UsersIndex;