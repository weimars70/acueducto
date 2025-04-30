import { db } from './db.service';
import type { Installation } from '../../types/installation';
import type { Consumption } from '../../types/consumption';

const normalizeConsumptionData = (consumption: Partial<Consumption>) => {
  return {
    ...consumption,
    instalacion: Number(consumption.instalacion) || 0,
    lectura: Number(consumption.lectura) || 0,
    consumo: Number(consumption.consumo) || 0,
    mes: Number(consumption.mes) || 1,
    year: Number(consumption.year) || new Date().getFullYear(),
    otros_cobros: Number(consumption.otros_cobros) || 0,
    reconexion: Number(consumption.reconexion) || 0,
    medidor: consumption.medidor || '',
    usuario: consumption.usuario || '',
    fecha: consumption.fecha || new Date().toISOString().split('T')[0]
  };
};

const normalizeInstallationData = (installation: any): Installation => {
  return {
    codigo: Number(installation.codigo) || 0,
    codigo_medidor: String(installation.codigo_medidor || ''),
    nombre: String(installation.nombre || ''),
    sector_nombre: String(installation.sector_nombre || ''),
    direccion: String(installation.direccion || ''),
    promedio: Number(installation.promedio || 0),
    lectura_anterior: Number(installation.lectura_anterior || 0)
  };
};

export const storageService = {
  // Instalaciones
  async saveInstallations(installations: any[]): Promise<void> {
    try {
      // Clear existing installations
      await db.installations.clear();
      
      // Process installations one by one
      for (const installation of installations) {
        const normalizedInstallation = normalizeInstallationData(installation);
        await db.installations.add(normalizedInstallation);
      }
    } catch (error) {
      console.error('Error al guardar instalaciones:', error);
      throw new Error(`Error al guardar instalaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getInstallations(): Promise<Installation[]> {
    try {
      return await db.installations.toArray();
    } catch (error) {
      console.error('Error al obtener instalaciones:', error);
      throw new Error(`Error al obtener instalaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getInstallationByCode(code: number): Promise<Installation | undefined> {
    try {
      return await db.installations
        .where('codigo')
        .equals(code)
        .first();
    } catch (error) {
      console.error('Error al obtener instalación por código:', error);
      throw new Error('Error al obtener la instalación de la base de datos local');
    }
  },

  // Consumos
  async saveOfflineConsumption(consumption: Partial<Consumption>): Promise<void> {
    try {
      const normalizedConsumption = normalizeConsumptionData(consumption);
      await db.offlineConsumptions.add({
        ...normalizedConsumption,
        syncStatus: 'pending'
      });
    } catch (error) {
      console.error('Error al guardar consumo offline:', error);
      throw new Error('Error al guardar el consumo en modo offline');
    }
  },

  async saveRecentConsumptions(consumptions: Consumption[]): Promise<void> {
    try {
      await db.consumptions.clear();
      
      // Process consumptions one by one
      for (const consumption of consumptions) {
        await db.consumptions.add(consumption);
      }
    } catch (error) {
      console.error('Error al guardar consumos recientes:', error);
      throw new Error('Error al guardar los consumos recientes');
    }
  },

  async getConsumptionById(id: number): Promise<Consumption | undefined> {
    try {
      return await db.consumptions.get(id);
    } catch (error) {
      console.error('Error al obtener consumo por ID:', error);
      throw new Error('Error al obtener el consumo de la base de datos local');
    }
  },

  async getConsumptions(filters: {
    year?: number | null;
    mes_codigo?: number | null;
    nombre?: string | null;
    instalacion?: number | null;
  } = {}): Promise<Consumption[]> {
    try {
      let query = db.consumptions.toCollection();

      if (filters.year) {
        query = query.filter(c => c.year === filters.year);
      }
      if (filters.mes_codigo) {
        query = query.filter(c => c.mes_codigo === filters.mes_codigo);
      }
      if (filters.nombre) {
        query = query.filter(c => c.nombre.toLowerCase().includes(filters.nombre.toLowerCase()));
      }
      if (filters.instalacion) {
        query = query.filter(c => c.instalacion === filters.instalacion);
      }

      return await query.toArray();
    } catch (error) {
      console.error('Error al obtener consumos:', error);
      throw new Error('Error al obtener los consumos de la base de datos local');
    }
  },

  async getPendingSyncConsumptions(): Promise<(Consumption & { id?: number })[]> {
    try {
      return await db.offlineConsumptions
        .where('syncStatus')
        .equals('pending')
        .toArray();
    } catch (error) {
      console.error('Error al obtener consumos pendientes:', error);
      throw new Error('Error al obtener los consumos pendientes de sincronización');
    }
  },

  async markConsumptionAsSynced(id: number): Promise<void> {
    try {
      await db.offlineConsumptions
        .where('id')
        .equals(id)
        .modify({ syncStatus: 'synced' });
    } catch (error) {
      console.error('Error al marcar consumo como sincronizado:', error);
      throw new Error('Error al actualizar el estado de sincronización del consumo');
    }
  }
};