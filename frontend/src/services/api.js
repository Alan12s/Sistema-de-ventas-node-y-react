// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const login = async (username, password) => (await api.post('/auth/login', { username, password })).data;
export const getProfile = async () => (await api.get('/auth/profile')).data;
export const register = async (userData) => (await api.post('/auth/register', userData)).data;

// ===== PRODUCTS =====
export const getProducts = async (params = {}) => (await api.get('/products', { params })).data;
export const getProductById = async (id) => (await api.get(`/products/${id}`)).data;
export const getProductByBarcode = async (barcode) => (await api.get(`/products/barcode/${barcode}`)).data;
export const createProduct = async (data) => (await api.post('/products', data)).data;
export const updateProduct = async (id, data) => (await api.put(`/products/${id}`, data)).data;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;
export const getLowStockProducts = async () => (await api.get('/products/low-stock')).data;

// ===== CATEGORIES =====
export const getCategories = async (params = {}) => (await api.get('/categories', { params })).data;
export const getCategoryById = async (id) => (await api.get(`/categories/${id}`)).data;
export const createCategory = async (data) => (await api.post('/categories', data)).data;
export const updateCategory = async (id, data) => (await api.put(`/categories/${id}`, data)).data;
export const deleteCategory = async (id) => (await api.delete(`/categories/${id}`)).data;

// ===== SALES =====
export const getSales = async (params = {}) => (await api.get('/sales', { params })).data;
export const getSaleById = async (id) => (await api.get(`/sales/${id}`)).data;
export const getTodaySales = async () => (await api.get('/sales/today')).data;
export const createSale = async (data) => (await api.post('/sales', data)).data;
export const cancelSale = async (id) => (await api.put(`/sales/${id}/cancel`)).data;

// ===== USERS =====
export const getUsers = async (params = {}) => (await api.get('/users', { params })).data;
export const getUserById = async (id) => (await api.get(`/users/${id}`)).data;
export const createUser = async (data) => (await api.post('/users', data)).data;
export const updateUser = async (id, data) => (await api.put(`/users/${id}`, data)).data;
export const changePassword = async (id, newPassword) => (await api.put(`/users/${id}/password`, { newPassword })).data;
export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

export default api;