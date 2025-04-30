import { apiClient } from './client';
import { storageService } from '../database/storage.service';
import { syncService } from '../sync/sync.service';
import type { Installation } from '../../types/installation';

export const installationService = {
  async getByCode(code: number): Promise<Installation> {
    try {
      if (syncService.isOnline()) {
        try {
          // Asegurarse de que el código sea un número
          const numericCode = Number(code);
          if (isNaN(numericCode)) {
            throw new Error('El código debe ser un número válido');
          }

          const { data } = await apiClient.get<Installation>(`/instalaciones`, {
            params: { codigo: numericCode }
          });

          if (!data) {
            throw new Error(`No se encontró la instalación con código ${numericCode}`);
          }

          // Normalizar los valores numéricos
          const installation = {
            ...data[0],
            codigo: numericCode,
            lectura_anterior: Number(data.lectura_anterior) || 0,
            promedio: Number(data.promedio) || 0
          };

          return installation;
        } catch (error: any) {
          // Si es un error de conexión, intentar obtener de la base de datos local
          if (error.isConnectionError) {
            const installation = await storageService.getInstallationByCode(code);
            if (installation) {
              return installation;
            }
          }
          
          // Si es un error 400, significa que la instalación no existe
          if (error.response?.status === 400) {
            throw new Error(`No se encontró la instalación con código ${code}`);
          }

          throw error;
        }
      } else {
        const installation = await storageService.getInstallationByCode(code);
        if (!installation) {
          throw new Error('Instalación no encontrada en la base de datos local');
        }
        return installation;
      }
    } catch (error: any) {
      if (error.isConnectionError) {
        const installation = await storageService.getInstallationByCode(code);
        if (!installation) {
          throw new Error('No hay conexión y la instalación no existe en la base de datos local');
        }
        return installation;
      }
      throw new Error(error.message || 'Error al buscar la instalación');
    }
  },

  async getAll(): Promise<Installation[]> {
    
    try {
      if (syncService.isOnline()) { 
        const  { data } = await apiClient.get<Installation[]>('/instalaciones/all');
        return data;
      } else {
        return await storageService.getInstallations();
      }
    } catch (error) {
      if (error.isConnectionError) {
        return await storageService.getInstallations();
      }
      console.error('Error getting installations:', error);
      throw new Error('Error al obtener las instalaciones');
    }
  }
};