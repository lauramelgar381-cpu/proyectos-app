# Compila la interfaz Vue
FROM node:24-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build-only

# Imagen final: backend + interfaz compilada
FROM node:24-alpine
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
EXPOSE 3000
CMD ["node", "index.js"]
