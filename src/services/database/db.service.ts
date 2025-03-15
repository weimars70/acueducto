import Dexie from 'dexie';
import type { Installation } from '../../types/installation';
import type { Consumption } from '../../types/consumption';

interface OfflineConsumption extends Consumption {
  id?: number;
  syncStatus: string;
}

export class AppDatabase extends Dexie {
  installations!: Dexie.Table<Installation, number>;
  consumptions!: Dexie.Table<Consumption, number>;
  offlineConsumptions!: Dexie.Table<OfflineConsumption, number>;

  constructor() {
    super('acueductosDB');
    
    this.version(1).stores({
      installations: 'codigo, codigo_medidor, nombre',
      consumptions: 'codigo, instalacion, fecha',
      offlineConsumptions: '++id, instalacion, fecha, syncStatus'
    });

    // Configurar manejo de errores para cada tabla
    this.installations.hook('creating').subscribe({
      error: error => this.handleError('installations', error)
    });

    this.consumptions.hook('creating').subscribe({
      error: error => this.handleError('consumptions', error)
    });

    this.offlineConsumptions.hook('creating').subscribe({
      error: error => this.handleError('offlineConsumptions', error)
    });
  }

  private handleError(table: string, error: any): void {
    console.error(`Database error in ${table}:`, {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
  }
}

export const db = new AppDatabase();