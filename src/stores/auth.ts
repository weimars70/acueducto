import { defineStore } from 'pinia';
import axios from 'axios';
import type { LoginCredentials, User } from '../types/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      console.log('credentials:::', credentials);
      console.log('::credentials:::', `${import.meta.env.VITE_API_URL}/auth/login`);
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, credentials);
        const { access_token, user } = response.data;
        
        if (access_token && user) {
          this.setSession(access_token, user);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    
    setSession(token: string, user: User) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configurar el token en el header por defecto de axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpiar el header de autorización
      delete axios.defaults.headers.common['Authorization'];
    },
    
    initializeAuth() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.setSession(token, user);
        } catch (e) {
          console.error('Error parsing user data:', e);
          this.logout(); // Clear invalid data
        }
      } else {
        this.logout(); // Ensure clean state if any data is missing
      }
    }
  }
});