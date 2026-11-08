# Mis Proyectos

Portafolio personal para publicar mis proyectos de programación. Tiene un sitio público con mi perfil y mis proyectos, y un panel privado para subirlos, editarlos y llevar un control de sus tareas y su estado.

# Características

# Sitio público
- Perfil: foto, nombre, título, biografía, habilidades, enlaces (GitHub, LinkedIn, correo), botón para descargar el CV en PDF y estadísticas generales.
- Proyectos destacados en la portada y tecnologías de esos proyectos con su icono.
- Trayectoria: línea de tiempo con los proyectos ordenados por fecha.
- Galería con búsqueda, filtro por tecnología, orden y paginación.
- Detalle de proyecto con tres pestañas: README (en Markdown), código (árbol de archivos con resaltado de sintaxis) e información.
- Modo claro y modo oscuro, con un botón que recuerda tu elección.

# Panel privado (requiere inicio de sesión)
- Subir proyectos desde una carpeta o repositorio local, con enlace de GitHub, demo, descripción, tecnologías, fecha, estado y portada. Se omiten automáticamente 'node_modules', '.git', 'dist', archivos binarios y archivos de más de 1 MB.
- Mis proyectos: tabla paginada (5 por página) con el estado de cada proyecto, que se cambia desde un selector.
- Editar proyecto: datos, portada, reemplazo de archivos o eliminación.
- Tareas por proyecto. Las tareas pendientes de los proyectos en progreso aparecen en el menú lateral, donde también se pueden marcar como hechas.
- Editar perfil: datos, foto y CV.

# Tecnologías

 Parte Stack 
| Frontend | Vue 3, Vite, Vue Router, Pinia, Tailwind CSS, DaisyUI, marked, DOMPurify, highlight.js, Simple Icons |
| Backend | Node.js, Express 5, Mongoose, Multer, JWT, bcryptjs |
| Base de datos | MongoDB |
| Despliegue local | Docker Compose |

# Estructura del proyecto

proyectos-app/
├── backend/            # API REST con Express y MongoDB
│   ├── models/         # Proyecto, Archivo, Tarea, Perfil
│   ├── routes/         # auth, perfil, proyectos, tareas
│   ├── middleware/     # Verificación del token de sesión
│   ├── utils/          # Slugs e imágenes
│   └── scripts/        # Respaldo, restauración y hash de contraseña
├── frontend/           # Interfaz Vue 3 + DaisyUI
│   └── src/
│       ├── api/        # Cliente HTTP y funciones por recurso
│       ├── components/ # Tarjetas, tabla, formularios, menú, selector de tema…
│       ├── layouts/    # Diseño del sitio público
│       ├── views/      # Perfil, galería, detalle, login, panel…
│       ├── router/     # Rutas públicas y protegidas
│       ├── stores/     # Estado de sesión y proyectos (Pinia)
│       └── utils/      # Tecnologías, Markdown, temas, formularios
├── Dockerfile          # Imagen de producción
├── docker-compose.yml  # Aplicación + MongoDB
└── README.md


La documentación detallada de la API y de MongoDB Compass está en [backend/README.md](backend/README.md).

# Requisitos

- Node.js: 22.18 o superior (o 24.12 o superior) para el frontend, y 20.19 o superior para el backend.
- MongoDB: local (Community Server o Docker) o en Atlas.
- Docker Desktop: solo si quieres usar Docker.

# Puesta en marcha (desarrollo)

1. Inicia MongoDB en 'mongodb://127.0.0.1:27017'. Si lo tienes con Docker, consulta la sección de MongoDB en [backend/README.md](backend/README.md).

2. Configura el backend:

   bash
   cd backend
   npm install
   cp .env.example .env
   

   Edita 'backend/.env' y completa:

   | Variable | Para qué sirve |
   | 'MONGODB_URI' | Dirección de la base de datos |
   | 'PORT' | Puerto de la API (por defecto '3000') |
   | 'ADMIN_USER' | Usuario para iniciar sesión |
   | 'ADMIN_PASSWORD_HASH' | Hash de tu contraseña (ver el paso 3) |
   | 'JWT_SECRET' | Texto largo y aleatorio para firmar las sesiones |

3. Genera el hash de tu contraseña y pégalo en 'ADMIN_PASSWORD_HASH', entre comillas simples:

   bash
   npm run crear-hash -- "tu-contraseña"
   

4. Inicia la API:

   bash
   npm run dev
   

5. En otra terminal, inicia la interfaz:

   bash
   cd frontend
   npm install
   npm run dev
   

6. Abre *http://localhost:5173*. Vite redirige '/api' a la API en el puerto 3000, así que no hace falta configurar CORS.

Para entrar al panel, pulsa Iniciar sesión en el sitio, usa el usuario y la contraseña que configuraste y espera la bienvenida.

# Uso

1. Perfil: en el panel, ve a Editar perfil para poner tu foto, tus datos y tu CV.
2. Subir proyecto: elige la carpeta del proyecto (o escribe el enlace de GitHub si no quieres subir la carpeta), agrega la descripción, las tecnologías y, si quieres, una portada.
3. Destacar: marca Mostrar en la portada para que el proyecto aparezca en la portada y en las tecnologías del perfil.
4. Estado y tareas: en Mis proyectos cambias el estado (en progreso / terminado) y entras a Tareas para llevar pendientes.

# Scripts

| Carpeta | Comando | Qué hace |
| 'backend' | 'npm run dev' | API con recarga automática |
| 'backend' | 'npm start' | API en modo normal |
| 'backend' | npm run crear-hash -- "contraseña" | Genera el hash de la contraseña |
| 'backend' | 'npm run respaldo' | Crea una copia de seguridad de la base |
| 'backend' | 'npm run restaurar -- <archivo> --confirmar' | Restaura una copia (reemplaza los datos) |
| 'frontend' | 'npm run dev' | Interfaz con Vite |
| 'frontend' | 'npm run build' | Revisión de tipos y build de producción |



# Seguridad y privacidad

- Solo existe un usuario, el administrador. La contraseña se guarda como hash bcrypt y nunca en texto plano.
- Las sesiones usan un token JWT que dura 8 horas.
- Los archivos `.env`, las copias de seguridad y `node_modules` no se suben a git.
- El README de cada proyecto se muestra con un filtro que elimina código peligroso.

# Solución de problemas

- 'ECONNREFUSED 127.0.0.1:27017': MongoDB no está corriendo. Revisa el servicio o el contenedor.
- No puedo iniciar sesión: revisa que 'ADMIN_USER', 'ADMIN_PASSWORD_HASH' y 'JWT_SECRET' estén en 'backend/.env' y reinicia la API.
- La interfaz no se conecta a la API: confirma que la API esté corriendo en el puerto 3000.
- Un proyecto no tiene archivos: los archivos de texto de más de 1 MB, los binarios y las carpetas 'node_modules', '.git' y 'dist' se omiten al subir.
- Los iconos de una tecnología no aparecen: se usa una lista de nombres conocidos. Si una herramienta no tiene icono, se muestra un icono genérico.
