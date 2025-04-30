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
      installations: '++id, codigo, codigo_medidor, nombre',
      consumptions: '++id, codigo, instalacion, fecha',
      offlineConsumptions: '++id, instalacion, fecha, syncStatus'
    });
  }
}

export const db = new AppDatabase();