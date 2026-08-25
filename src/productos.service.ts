import productosJson from './data/productos.json';

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  tasa: number;
  plazoMeses: number;
  activo: boolean;
}

export const CATEGORIAS_VALIDAS = ['credito', 'ahorro', 'seguro'] as const;

const productos: Producto[] = productosJson as Producto[];

export function listarProductos(soloActivos = false): Producto[] {
  return soloActivos ? productos.filter((p) => p.activo) : [...productos];
}

export function buscarPorId(id: number): Producto | undefined {
  return productos.find((p) => p.id === id);
}

export function filtrarPorCategoria(categoria: string): Producto[] {
  return productos.filter((p) => p.categoria === categoria);
}

/**
 * Cuota nivelada (sistema frances).
 * @param monto capital solicitado
 * @param tasaAnual tasa nominal anual en porcentaje (18.5 = 18.5%)
 * @param plazoMeses cantidad de cuotas
 */
export function calcularCuota(monto: number, tasaAnual: number, plazoMeses: number): number {
  if (monto <= 0) throw new Error('El monto debe ser mayor a cero');
  if (plazoMeses <= 0) throw new Error('El plazo debe ser mayor a cero');

  const i = tasaAnual / 100 / 12;
  if (i === 0) return redondear(monto / plazoMeses);

  const cuota = (monto * i) / (1 - Math.pow(1 + i, -plazoMeses));
  return redondear(cuota);
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
