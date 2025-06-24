export const formatearNumero = (numero: number | string): string => {
  const num = typeof numero === 'string' ? parseFloat(numero) : numero;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('es-CO').format(num);
};

export const formatearInput = (valor: string | number): string => {
  if (!valor) return '';
  const soloNumeros = valor.toString().replace(/\D/g, '');
  if (!soloNumeros) return '';
  return new Intl.NumberFormat('es-CO').format(parseInt(soloNumeros));
};

export const parsearInput = (valor: string | number): string => {
  if (!valor) return '';
  const soloNumeros = valor.toString().replace(/\D/g, '');
  return soloNumeros ? parseInt(soloNumeros).toString() : '';
};

export const formatearMoneda = (valor: number | string): string => {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return '$0';
  return `$${formatearNumero(num)}`;
};

export const formatearPorcentaje = (valor: number | string): string => {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return '0%';
  return `${num.toFixed(1)}%`;
};