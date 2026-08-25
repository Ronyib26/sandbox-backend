import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  listarProductos,
  buscarPorId,
  filtrarPorCategoria,
  calcularCuota,
  CATEGORIAS_VALIDAS,
} from '../src/productos.service';

describe('catalogo de productos', () => {
  test('devuelve todos los productos', () => {
    assert.ok(listarProductos().length >= 1);
  });

  test('filtra solo los activos', () => {
    const activos = listarProductos(true);
    assert.ok(activos.every((p) => p.activo === true));
  });

  test('todas las categorias del catalogo son validas', () => {
    for (const producto of listarProductos()) {
      assert.ok(
        (CATEGORIAS_VALIDAS as readonly string[]).includes(producto.categoria),
        `categoria invalida: ${producto.categoria}`,
      );
    }
  });

  test('busca por id y devuelve undefined si no existe', () => {
    assert.equal(buscarPorId(1)?.id, 1);
    assert.equal(buscarPorId(99999), undefined);
  });

  test('filtra por categoria', () => {
    const creditos = filtrarPorCategoria('credito');
    assert.ok(creditos.length > 0);
    assert.ok(creditos.every((p) => p.categoria === 'credito'));
  });
});

describe('calculo de cuota', () => {
  test('calcula la cuota nivelada', () => {
    // 10000 a 12% anual en 12 meses => 888.49
    assert.equal(calcularCuota(10000, 12, 12), 888.49);
  });

  test('con tasa 0 reparte el capital en partes iguales', () => {
    assert.equal(calcularCuota(1200, 0, 12), 100);
  });

  test('rechaza monto invalido', () => {
    assert.throws(() => calcularCuota(0, 12, 12), /monto/);
  });

  test('rechaza plazo invalido', () => {
    assert.throws(() => calcularCuota(1000, 12, 0), /plazo/);
  });
});
