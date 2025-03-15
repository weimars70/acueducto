import { months } from '../utils/dates';

export interface Consumption {
  codigo: number;
  instalacion: number;
  nombre: string;
  lectura: number;
  fecha: string;
  mes: string;
  mes_codigo: number; // Agregado el campo mes_codigo
  year: number;
  consumo: number;
  medidor: string;
  otros_cobros: number;
  reconexion: number;
  facturado: boolean;
  sector_nombre?: string;
  direccion?: string;
  lectura_anterior?: number;
  promedio?: number;
}

// Función auxiliar para obtener el mes_codigo desde el texto del mes
export function getMesCodigoFromText(mesText: string): number {
  const month = months.find(m => m.text === mesText);
  return month?.value || 1;
}

// Función auxiliar para obtener el texto del mes desde mes_codigo
export function getTextFromMesCodigo(mesCodigo: number): string {
  const month = months.find(m => m.value === mesCodigo);
  return month?.text || '';
}