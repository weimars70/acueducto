export interface SubsidyData {
  basicData: {
    estrato: number;
    total_usuarios: number;
    cargo_fijo: number;
    consumo_basico: number;
    consumo_complementario: number;
    consumo_suntuario: number;
    empresa: string;
    fechas: string;
  }[];
  
  detailedData: {
    estrato: number;
    total_usuarios: number;
    cargo_fijo: number;
    consumo_basico: number;
    consumo_complementario: number;
    consumo_suntuario: number;
    empresa: string;
    fechas: string;
    por_cargo_fijo: number;
    por_consumo: number;
    metros_basico: number;
    metros_complementario: number;
    metros_suntuario: number;
  }[];
  
  totals: {
    estrato: number;
    cargo_fijo: number;
    total_consumo_basico: number;
    total_consumo_complementario: number;
    total_consumo_suntuario: number;
    total_valor_subsidio: number;
    total_base_subsidio: number;
  }[];
  
  summary: {
    valor_subsidios: number;
    valor_contribucion: number;
    tot_contribuciones: number;
  };
}