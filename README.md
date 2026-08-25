# Sandbox Backend

API minima (Node 20 + Express + TypeScript, **sin base de datos**) creada para practicar
el flujo de ramas y el CI/CD sin tocar el proyecto real.

## Que expone

| Metodo | Ruta                  | Descripcion                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/health`             | Estado + ambiente + version (lo usa el CD)|
| GET    | `/api/productos`      | Catalogo (`?categoria=credito`, `?activos=true`) |
| GET    | `/api/productos/:id`  | Un producto (404 si no existe)           |
| POST   | `/api/cotizar`        | `{ productoId, monto }` -> cuota nivelada |

Los datos viven en `src/data/productos.json`. **Ese archivo es el que valida el CI.**

## Comandos

```bash
npm ci                 # instalar dependencias (igual que en CI)
npm run typecheck      # TypeScript sin emitir archivos
npm run validate:data  # valida productos.json (falla el CI si esta mal)
npm test               # compila y corre las pruebas
npm run ci             # las tres anteriores: correlo ANTES de hacer push
npm run build && npm start
```

## Workflows

| Archivo | Cuando corre | Que hace |
|---------|--------------|----------|
| `ci.yml` | PR y push a QA/develop/main | typecheck, valida datos, tests, build de imagen |
| `quality-qa.yml` | PR y push a QA | puerta de calidad (equivalente a SonarCloud) |
| `cd.yml` | push a QA/develop/main | publica imagen a GHCR y "despliega" con smoke test |

Mapeo rama -> ambiente (identico al proyecto real):

| Rama | Ambiente | Slot |
|------|----------|------|
| `main` | produccion | production |
| `develop` | preproduccion | preproduccion |
| `QA` | qa | qa |

## Para romperlo a proposito (y aprender)

- Pon un `id` duplicado en `productos.json` -> falla `validate:data`.
- Cambia `"categoria": "credito"` por `"prestamo"` -> falla `validate:data` y un test.
- Cambia el redondeo de `calcularCuota` -> falla un test unitario.
- Agrega un `console.log` en `src/productos.service.ts` -> falla el Quality Gate de QA.
- Quita un `: number` y pon un tipo malo -> falla el typecheck.
