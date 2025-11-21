// frontend/src/store/authStore.js
import { create } from 'zustand';

/**
 * Store de autenticación usando Zustand
 * Maneja el estado del usuario logueado
 */
const useAuthStore = create((set) => ({
  // Estado inicial
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Acción: Login
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true
    });
  },

  // Acción: Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },

  // Acción: Actualizar usuario
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  }
}));

export default useAuthStore;