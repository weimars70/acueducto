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

export const storageService = {
  // Instalaciones
  async saveInstallations(installations: Installation[]): Promise<void> {
    await db.installations.clear();
    await db.installations.bulkAdd(installations);
  },

  async getInstallations(): Promise<Installation[]> {
    return await db.installations.toArray();
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

  async getConsumptionById(id: number): Promise<Consumption | undefined> {
    return await db.consumptions.get(id);
  },

  async getConsumptions(filters: {
    year?: number | null;
    mes_codigo?: number | null;
    nombre?: string | null;
    instalacion?: number | null;
  } = {}): Promise<Consumption[]> {
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
  },

  async getPendingSyncConsumptions(): Promise<(Consumption & { id?: number })[]> {
    return await db.offlineConsumptions
      .where('syncStatus')
      .equals('pending')
      .toArray();
  },

  async markConsumptionAsSynced(id: number): Promise<void> {
    await db.offlineConsumptions
      .where('id')
      .equals(id)
      .modify({ syncStatus: 'synced' });
  }
};