# Mis Proyectos

Plataforma para subir carpetas o repositorios de código, guardarlos en MongoDB y navegarlos desde una interfaz Vue + DaisyUI.

## Estructura

```
proyectos-app/
├── backend/    # API: Express, Mongoose, Multer (ver backend/README.md)
└── frontend/   # Interfaz: Vue 3, Vite, Pinia, Tailwind + DaisyUI
```

## Puesta en marcha

Necesitas Node.js 22.18 o superior (o 24.12+) y MongoDB corriendo. La guía completa de MongoDB y Compass está en [backend/README.md](backend/README.md).

En una terminal, el backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

En otra terminal, el frontend:

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Vite redirige `/api` al backend en el puerto 3000, así que no necesitas configurar CORS.

## Scripts

| Carpeta    | Comando         | Qué hace                                  |
| ---------- | --------------- | ----------------------------------------- |
| `backend`  | `npm run dev`   | API con recarga automática                |
| `backend`  | `npm start`     | API en modo normal                        |
| `frontend` | `npm run dev`   | Interfaz con Vite                         |
| `frontend` | `npm run build` | Type-check y build de producción          |

## Producción con Docker

Un solo comando levanta la aplicación y su base de datos (requiere Docker Desktop):

```bash
docker compose up -d --build
```

- La aplicación queda en http://localhost:3000.
- MongoDB queda solo en tu computadora, en `localhost:27018`. Conéctate con Compass usando `mongodb://localhost:27018`.
- Los datos se guardan en el volumen `mongo-datos`, así que sobreviven a reinicios.
- Para detenerlo: `docker compose down` (no borra los datos).

## Copias de seguridad

Dentro de `backend/`:

```bash
npm run respaldo
```

Crea un archivo `backups/respaldo-AAAA-MM-DD….json` con todas las colecciones, incluidas las fotos y el CV. Conserva los últimos 14 respaldos.

Para restaurar (reemplaza los datos actuales):

```bash
npm run restaurar -- ../backups/respaldo-AAAA-MM-DD….json --confirmar
```

Los respaldos contienen tus datos: la carpeta `backups/` está en `.gitignore` y no se sube a git.
