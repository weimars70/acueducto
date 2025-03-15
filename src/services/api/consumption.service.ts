import { apiClient } from './client';
import { storageService } from '../database/storage.service';
import { syncService } from '../sync/sync.service';
import type { Consumption } from '../../types/consumption';
import type { PaginatedResponse } from '../../types/api';

export const consumptionService = {
  async getConsumptions(params: {
    year?: number | null;
    mes_codigo?: number | null;
    nombre?: string;
    instalacion?: number | null;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Consumption>> {
    try {
      const { page, limit, ...filters } = params;
      const queryParams = new URLSearchParams();
      
      if (page !== undefined) {
        queryParams.append('page', page.toString());
      }
      
      if (limit !== undefined) {
        queryParams.append('limit', limit.toString());
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const { data } = await apiClient.get<PaginatedResponse<Consumption>>('/consumo/view', { 
        params: queryParams
      });

      return data;
    } catch (error) {
      if (error.isConnectionError) {
        return {
          data: await storageService.getConsumptions(params),
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10
        };
      }
      throw error;
    }
  },

  async getById(id: number): Promise<Consumption> {
    try {
      const { data } = await apiClient.get<Consumption>(`/consumo/${id}`);
      const normalizedData = {
        ...data,
        lectura_anterior: data.lectura_anterior ?? 0,
        promedio: data.promedio ?? 0
      };

      return normalizedData;
    } catch (error) {
      if (error.isConnectionError) {
        const localData = await storageService.getConsumptionById(id);
        if (localData) {
          return localData;
        }
      }
      throw error;
    }
  },

  async create(consumption: Partial<Consumption>): Promise<Consumption> {
    try {
      if (!syncService.isOnline()) {
        await storageService.saveOfflineConsumption(consumption);
        return consumption as Consumption;
      }

      const { data } = await apiClient.post<Consumption>('/consumo', consumption);
      return data;
    } catch (error) {
      if (error.isConnectionError) {
        await storageService.saveOfflineConsumption(consumption);
        return consumption as Consumption;
      }
      throw error;
    }
  },

  async update(id: number, consumption: Partial<Consumption>): Promise<Consumption> {
    try {
      if (!syncService.isOnline()) {
        throw new Error('No se puede actualizar sin conexión');
      }
      console.log(':::consumption:::', consumption);
      const { data } = await apiClient.put<Consumption>(`/consumo/${id}`, {
        instalacion: parseInt(consumption.instalacion.toString()),
        lectura: parseFloat(consumption.lectura),
        fecha: consumption.fecha,
        consumo: parseFloat(consumption.consumo),
        mes: consumption.mes,
        year: parseInt(consumption.year),
        medidor: consumption.medidor,
        otros_cobros: parseFloat(consumption.otros_cobros),
        reconexion: parseFloat(consumption.reconexion),
        usuario: consumption.usuario
      });
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};