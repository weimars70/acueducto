export const consumptionColumns = [
  { 
    name: 'codigo', 
    label: 'Código', 
    field: 'codigo', 
    sortable: true, 
    align: 'left'
  },
  { 
    name: 'instalacion', 
    label: 'Instalación', 
    field: 'instalacion', 
    sortable: true, 
    align: 'left'
  },
  { 
    name: 'nombre', 
    label: 'Nombre', 
    field: 'nombre', 
    sortable: true, 
    align: 'left'
  },
  { 
    name: 'lectura', 
    label: 'Lectura', 
    field: 'lectura', 
    sortable: true, 
    align: 'right'
  },
  { 
    name: 'fecha', 
    label: 'Fecha', 
    field: 'fecha', 
    sortable: true, 
    align: 'center'
  },
  { 
    name: 'mes', 
    label: 'Mes', 
    field: 'mes', 
    sortable: true, 
    align: 'left'
  },
  { 
    name: 'year', 
    label: 'Año', 
    field: 'year', 
    sortable: true, 
    align: 'center'
  },
  { 
    name: 'consumo', 
    label: 'Consumo', 
    field: 'consumo', 
    sortable: true, 
    align: 'right'
  },
  { 
    name: 'medidor', 
    label: 'Medidor', 
    field: 'medidor', 
    sortable: true, 
    align: 'left'
  },
  { 
    name: 'facturado', 
    label: 'Estado', 
    field: 'facturado', 
    sortable: true, 
    align: 'center',
    format: (val: boolean) => val ? 'Facturado' : 'Pendiente'
  }
];