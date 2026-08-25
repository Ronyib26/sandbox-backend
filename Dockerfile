# ============================================================
# Etapa 1: build  (misma idea que el Dockerfile de CORSA Backend)
# ============================================================
FROM node:20-bullseye-slim AS build

ENV TZ=America/Guatemala
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY . .

# Puerta de calidad dentro de la imagen: si los datos estan mal, la imagen NO se construye
RUN npm run validate:data
RUN npm run build

RUN if [ -f /app/dist/src/main.js ]; then \
      echo "OK: dist/src/main.js encontrado"; \
    else \
      echo "ERROR: dist/src/main.js NO encontrado" && exit 1; \
    fi

# ============================================================
# Etapa 2: runtime
# ============================================================
FROM node:20-bullseye-slim AS runtime

ENV TZ=America/Guatemala
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
