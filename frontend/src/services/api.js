// frontend/src/services/api.js
import axios from 'axios';

// URL base del backend
const API_URL = 'http://localhost:5000/api';

// Crear instancia de axios con configuración
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token es inválido o expiró, limpiar y redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== FUNCIONES DE AUTENTICACIÓN =====

/**
 * Login de usuario
 */
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

/**
 * Obtener perfil del usuario
 */
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

/**
 * Registrar nuevo usuario (solo admin)
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// ===== FUNCIONES DE PRODUCTOS =====

/**
 * Obtener todos los productos
 */
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`); // ✅ CORREGIDO: agregado $
  return response.data;
};

/**
 * Buscar producto por código de barras
 */
export const getProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${barcode}`); // ✅ CORREGIDO: agregado $
  return response.data;
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

/**
 * Actualizar producto
 */
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData); // ✅ CORREGIDO: agregado $
  return response.data;
};

/**
 * Eliminar producto
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`); // ✅ CORREGIDO: agregado $
  return response.data;
};

/**
 * Obtener productos con stock bajo
 */
export const getLowStockProducts = async () => {
  const response = await api.get('/products/low-stock');
  return response.data;
};

// ===== FUNCIONES DE CATEGORÍAS (PREPARADAS PARA FUTURO) =====

/**
 * Obtener todas las categorías
 */
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export default api;