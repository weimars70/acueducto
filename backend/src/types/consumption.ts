export interface Consumption {
  codigo: number;
  instalacion: number;
  nombre: string;
  lectura: number;
  fecha: string;
  mes: string;
  year: number;
  mes_codigo: number;
  consumo: number;
  medidor: string;
  otros_cobros: number;
  reconexion: number;
  facturado: boolean;
}