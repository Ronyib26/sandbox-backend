import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { crearApp } from '../src/main';

let server: Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = crearApp().listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('API HTTP', () => {
  test('GET /health responde ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string };
    assert.equal(body.status, 'ok');
  });

  test('GET /api/productos devuelve el catalogo', async () => {
    const res = await fetch(`${baseUrl}/api/productos`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(await res.json()));
  });

  test('GET /api/productos/:id inexistente devuelve 404', async () => {
    const res = await fetch(`${baseUrl}/api/productos/99999`);
    assert.equal(res.status, 404);
  });

  test('POST /api/cotizar devuelve la cuota', async () => {
    const res = await fetch(`${baseUrl}/api/cotizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId: 1, monto: 10000 }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { cuota: number };
    assert.ok(body.cuota > 0);
  });
});
