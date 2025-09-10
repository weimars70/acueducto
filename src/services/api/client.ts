import axios from 'axios';
import { API_URL } from '../../config/environment';
import { useAuthStore } from '../../stores/auth';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición API:', error);
    
    if (error.code === 'ECONNABORTED' || !error.response) {
      error.isConnectionError = true;
      error.message = 'No hay conexión con el servidor';
      console.error('Error de conexión:', error.message);
      console.error('Verifique que el backend esté corriendo en:', API_URL);
      throw error;
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      // Comentado temporalmente para pruebas
      // authStore.logout();
      error.isAuthError = true;
      error.message = 'Sesión expirada. Por favor inicie sesión nuevamente.';
      console.error('Error de autenticación:', error.message);
    }

    console.error('Detalles del error:', error.response?.data || error.message);
    console.error('URL de la petición:', error.config?.url);
    console.error('Método de la petición:', error.config?.method);
    console.error('Datos enviados:', error.config?.data);
    throw error;
  }
);