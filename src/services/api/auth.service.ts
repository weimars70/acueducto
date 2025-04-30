import { apiClient } from './client';
import type { LoginCredentials } from '../../types/auth';

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },
};