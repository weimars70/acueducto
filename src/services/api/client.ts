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
    if (error.code === 'ECONNABORTED' || !error.response) {
      error.isConnectionError = true;
      error.message = 'No hay conexión con el servidor';
      throw error;
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      error.isAuthError = true;
      error.message = 'Sesión expirada. Por favor inicie sesión nuevamente.';
    }

    throw error;
  }
);