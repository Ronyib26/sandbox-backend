import express from 'express';
import {
  listarProductos,
  buscarPorId,
  filtrarPorCategoria,
  calcularCuota,
} from './productos.service';

export function crearApp() {
  const app = express();
  app.use(express.json());

  // Health check: lo usa el "deploy" para verificar que la app levanto
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: process.env.ENV_NAME ?? 'local',
      version: process.env.APP_VERSION ?? 'dev',
    });
  });

  app.get('/api/productos', (req, res) => {
    const { categoria, activos } = req.query;
    if (typeof categoria === 'string') {
      return res.json(filtrarPorCategoria(categoria));
    }
    return res.json(listarProductos(activos === 'true'));
  });

  app.get('/api/productos/:id', (req, res) => {
    const producto = buscarPorId(Number(req.params.id));
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    return res.json(producto);
  });

  app.post('/api/cotizar', (req, res) => {
    const { productoId, monto } = req.body ?? {};
    const producto = buscarPorId(Number(productoId));
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    try {
      const cuota = calcularCuota(Number(monto), producto.tasa, producto.plazoMeses);
      return res.json({
        producto: producto.nombre,
        monto: Number(monto),
        tasa: producto.tasa,
        plazoMeses: producto.plazoMeses,
        cuota,
      });
    } catch (error) {
      return res.status(400).json({ mensaje: (error as Error).message });
    }
  });

  return app;
}

// Solo levanta el servidor si el archivo se ejecuta directo (no al importarlo en tests)
if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  crearApp().listen(port, () => {
    console.log(`Sandbox backend escuchando en http://localhost:${port} [${process.env.ENV_NAME ?? 'local'}]`);
  });
}
