#!/usr/bin/env node
/**
 * Valida src/data/productos.json ANTES de compilar o desplegar.
 * Si algo esta mal, sale con codigo 1 y el workflow de GitHub Actions falla en rojo.
 *
 * Esta es la pieza que te sirve para practicar: rompe el JSON a proposito
 * (id duplicado, tasa negativa, categoria inventada) y mira como el CI te bloquea el PR.
 */
const fs = require('node:fs');
const path = require('node:path');

const RUTA = path.join(__dirname, '..', 'src', 'data', 'productos.json');
const CATEGORIAS_VALIDAS = ['credito', 'ahorro', 'seguro'];

const errores = [];
const agregar = (msg) => errores.push(msg);

let productos;
try {
  productos = JSON.parse(fs.readFileSync(RUTA, 'utf8'));
} catch (e) {
  console.error(`[data] JSON invalido en ${RUTA}: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(productos)) {
  console.error('[data] El archivo debe contener un arreglo de productos');
  process.exit(1);
}

if (productos.length === 0) {
  agregar('El catalogo no puede estar vacio');
}

const idsVistos = new Set();

productos.forEach((p, indice) => {
  const etiqueta = `producto #${indice} (id=${p?.id ?? 'sin id'})`;

  if (!Number.isInteger(p.id) || p.id <= 0) {
    agregar(`${etiqueta}: "id" debe ser un entero mayor a 0`);
  } else if (idsVistos.has(p.id)) {
    agregar(`${etiqueta}: "id" duplicado`);
  } else {
    idsVistos.add(p.id);
  }

  if (typeof p.nombre !== 'string' || p.nombre.trim().length === 0) {
    agregar(`${etiqueta}: "nombre" es obligatorio`);
  } else if (p.nombre.length > 60) {
    agregar(`${etiqueta}: "nombre" no puede pasar de 60 caracteres`);
  }

  if (!CATEGORIAS_VALIDAS.includes(p.categoria)) {
    agregar(`${etiqueta}: "categoria" debe ser una de ${CATEGORIAS_VALIDAS.join(', ')}`);
  }

  if (typeof p.tasa !== 'number' || p.tasa < 0 || p.tasa > 100) {
    agregar(`${etiqueta}: "tasa" debe ser un numero entre 0 y 100`);
  }

  if (!Number.isInteger(p.plazoMeses) || p.plazoMeses <= 0 || p.plazoMeses > 360) {
    agregar(`${etiqueta}: "plazoMeses" debe ser un entero entre 1 y 360`);
  }

  if (typeof p.activo !== 'boolean') {
    agregar(`${etiqueta}: "activo" debe ser true o false`);
  }
});

if (errores.length > 0) {
  console.error(`\n[data] Validacion FALLIDA: ${errores.length} error(es)\n`);
  errores.forEach((e) => console.error(`  - ${e}`));
  console.error('');
  process.exit(1);
}

console.log(`[data] Validacion OK: ${productos.length} productos, ${idsVistos.size} ids unicos.`);
