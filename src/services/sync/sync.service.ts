import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { storageService } from '../database/storage.service';
import { consumptionService } from '../api/consumption.service';
import { installationService } from '../api/installation.service';
import { apiClient } from '../api/client';

export class SyncService {
  private networkStatus: { connected: boolean } | null = null;
  private syncInProgress = false;

  constructor() {
    this.initializeNetworkListeners();
  }

  private async initializeNetworkListeners(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      this.networkStatus = { connected: navigator.onLine };
      window.addEventListener('online', () => {
        this.networkStatus = { connected: true };
        this.syncPendingData().catch(console.error);
      });
      window.addEventListener('offline', () => {
        this.networkStatus = { connected: false };
      });
      return;
    }

    try {
      this.networkStatus = await Network.getStatus();

      Network.addListener('networkStatusChange', status => {
        const wasOffline = !this.networkStatus?.connected;
        this.networkStatus = status;
        
        if (wasOffline && status.connected) {
          this.syncPendingData().catch(console.error);
        }
      });
    } catch (error) {
      console.error('Error initializing network listeners:', error);
      this.networkStatus = { connected: navigator.onLine };
    }
  }

  private normalizeConsumptionData(consumption: any) {
    const normalizedData = {
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

    const { id, syncStatus, ...finalData } = normalizedData;
    return finalData;
  }

  async syncPendingData(): Promise<void> {
    if (!this.networkStatus?.connected || this.syncInProgress) {
      console.log('Sincronización no posible: ' + 
        (!this.networkStatus?.connected ? 'sin conexión' : 'sincronización en progreso'));
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('Iniciando sincronización de datos pendientes...');
      
      const pendingConsumptions = await storageService.getPendingSyncConsumptions();
      console.log(`Encontrados ${pendingConsumptions.length} consumos pendientes`);

      for (const consumption of pendingConsumptions) {
        try {
          console.log('Sincronizando consumo:', consumption);
          const normalizedData = this.normalizeConsumptionData(consumption);
          await consumptionService.create(normalizedData);
          
          if (consumption.id) {
            await storageService.markConsumptionAsSynced(consumption.id);
            console.log(`Consumo ID: ${consumption.id} sincronizado exitosamente`);
          }
        } catch (error) {
          console.error(
            'Error syncing consumption:',
            error instanceof Error ? error.message : 'Unknown error',
            '\nConsumption:', consumption
          );
        }
      }

      console.log('Sincronización completada');
    } catch (error) {
      console.error(
        'Error in sync process:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error('Error al sincronizar los datos pendientes');
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncViews(): Promise<void> {
    if (!this.networkStatus?.connected) {
      throw new Error('No hay conexión a internet');
    }

    if (this.syncInProgress) {
      throw new Error('Ya hay una sincronización en progreso');
    }

    try {
      this.syncInProgress = true;
      console.log('Iniciando sincronización de vistas...');

      // Sincronizar instalaciones
      const installations = await installationService.getAll();
      //console.log('Iniciando sincronización de vistas...', installations);
      await storageService.saveInstallations(installations);
      console.log('Instalaciones sincronizadas');

      // Obtener fecha actual
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      let currentMonth = currentDate.getMonth() ;
      console.log('currentMonth:::', currentMonth);
      currentMonth = currentMonth +1;
    
      // Obtener consumos del último mes
      const { data: recentConsumptions } = await apiClient.get('/consumo/last-readings', {
        params: {
          year: currentYear,
          month: currentMonth
        }
      });

      //console.log('data retornada del back', recentConsumptions);
      
      // Guardar consumos recientes
      await storageService.saveRecentConsumptions(recentConsumptions);
      console.log('Consumos recientes sincronizados');

      // Sincronizar consumos pendientes
      await this.syncPendingData();
      console.log('Consumos pendientes sincronizados');

      console.log('Sincronización completada exitosamente');
    } catch (error) {
      console.error('Error en sincronización:', error);
      throw new Error('Error al sincronizar las vistas');
    } finally {
      this.syncInProgress = false;
    }
  }

  isOnline(): boolean {
    return this.networkStatus?.connected || false;
  }

  isMobile(): boolean {
    return Capacitor.getPlatform() !== 'web';
  }
}

export const syncService = new SyncService();