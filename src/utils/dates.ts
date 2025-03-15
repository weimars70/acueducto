export const months = [
  { value: 1, text: 'ENERO' },
  { value: 2, text: 'FEBRERO' },
  { value: 3, text: 'MARZO' },
  { value: 4, text: 'ABRIL' },
  { value: 5, text: 'MAYO' },
  { value: 6, text: 'JUNIO' },
  { value: 7, text: 'JULIO' },
  { value: 8, text: 'AGOSTO' },
  { value: 9, text: 'SEPTIEMBRE' },
  { value: 10, text: 'OCTUBRE' },
  { value: 11, text: 'NOVIEMBRE' },
  { value: 12, text: 'DICIEMBRE' }
];

export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonth = () => {
  return new Date().getMonth() + 1;
};

export const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};