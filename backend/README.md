# Backend: Mis Proyectos

API con Express 5, Mongoose y Multer. Guarda los proyectos y sus archivos en MongoDB, que puedes ver y revisar con MongoDB Compass.

## 1. Tener MongoDB corriendo

Elige una de estas opciones.

### Opción A: Docker Desktop (la más simple)

Con Docker Desktop abierto, ejecuta:

```bash
docker run -d --name mongo-proyectos -p 27017:27017 -v mongo-data:/data/db mongo:7
```

- `-p 27017:27017` publica MongoDB en `localhost:27017`.
- `-v mongo-data:/data/db` guarda los datos aunque borres el contenedor.
- Para arrancarlo de nuevo otro día: `docker start mongo-proyectos`.

### Opción B: MongoDB Community Server en Windows

1. Descarga el instalador desde https://www.mongodb.com/try/download/community.
2. Durante la instalación, deja marcada la opción **Install MongoDB as a Service** (queda corriendo en el puerto 27017).
3. Marca también **MongoDB Compass** si no lo tienes instalado.

### Opción C: MongoDB Atlas (en la nube)

Crea un cluster gratuito, permite tu IP en *Network Access* y copia la cadena de conexión (`mongodb+srv://...`) en `MONGODB_URI`.

## 2. Conectar MongoDB Compass

1. Abre MongoDB Compass.
2. En la pantalla de inicio, en **URI**, escribe:

   ```
   mongodb://127.0.0.1:27017
   ```

3. Pulsa **Connect**.

Compass muestra una lista de bases de datos. La base `proyectos_app` aparece **cuando se guarda el primer proyecto**: MongoDB crea las bases y colecciones la primera vez que escribe en ellas, no antes. Si no la ves, no es un error.

Una vez creada, verás:

| Colección   | Qué guarda                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| `proyectos` | Un documento por proyecto: nombre, descripción, tecnologías, nº de archivos y tamaño. |
| `archivos`  | Un documento por archivo: `proyecto` (id del proyecto), `ruta`, `contenido` y `tamano`. |

En la pestaña **Indexes** de `archivos` verás el índice `{ proyecto, ruta }`, que acelera la búsqueda de los archivos de cada proyecto.

## 3. Configurar el backend

Entra en esta carpeta y crea tu archivo de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

Contenido de `.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/proyectos_app
PORT=3000
```

- Si usas Atlas, cambia `MONGODB_URI` por tu cadena `mongodb+srv://...`.
- El `.env` no se sube a git (está en `.gitignore`).

### Si usas WSL y MongoDB está en Windows

Normalmente `127.0.0.1` funciona desde WSL. Si la conexión falla con `ECONNREFUSED`, usa la IP de Windows que aparece en el `nameserver` de:

```bash
cat /etc/resolv.conf
```

y ponla en `MONGODB_URI`, por ejemplo `mongodb://172.20.32.1:27017/proyectos_app`. Recuerda que MongoDB también tiene que aceptar conexiones desde fuera de `127.0.0.1` en ese caso.

## 4. Instalar y ejecutar

```bash
npm install
npm run dev
```

`npm run dev` reinicia el servidor solo cuando cambias un archivo. Para producción usa `npm start`.

Si todo está bien verás:

```
MongoDB conectada: 127.0.0.1/proyectos_app
API escuchando en http://localhost:3000
```

Si MongoDB no está disponible, el servidor se detiene con un mensaje que indica revisar `MONGODB_URI`.

## 5. Comprobar la conexión

Con el backend corriendo:

```bash
curl http://localhost:3000/api/salud
```

Respuesta esperada:

```json
{"api":"ok","mongodb":"conectada","baseDeDatos":"proyectos_app"}
```

## Autenticación del administrador

Solo el administrador puede crear, editar, eliminar y subir archivos. Las lecturas son públicas.

1. Genera el hash de tu contraseña:

   ```bash
   npm run crear-hash -- "tu-contraseña"
   ```

2. Pega el resultado en `.env` dentro de `ADMIN_PASSWORD_HASH` (entre comillas simples) y define `ADMIN_USER` y `JWT_SECRET`.
3. Reinicia el backend. El login se hace en `/login` del frontend.

## Endpoints

| Método | Ruta | Acceso | Descripción |
| ------ | ---- | ------ | ----------- |
| GET | `/api/salud` | público | Estado de la API y de MongoDB |
| POST | `/api/auth/login` | público | Devuelve un token JWT (8 h) |
| GET | `/api/auth/sesion` | token | Comprueba que la sesión sigue activa |
| GET | `/api/perfil` | público | Datos de la página "Sobre mí" |
| PUT | `/api/perfil` | token | Actualiza el perfil |
| GET | `/api/proyectos` | público | Listado. Filtros: `q`, `tecnologia`, `orden` (reciente, antiguo, nombre), `destacados=1` |
| GET | `/api/proyectos/tecnologias` | público | Tecnologías con su número de proyectos |
| GET | `/api/proyectos/estadisticas` | público | Totales y tecnologías más usadas |
| GET | `/api/proyectos/:id` | público | Detalle y lista de archivos. Acepta id o slug |
| GET | `/api/proyectos/:id/readme` | público | README.md de la raíz (404 si no existe) |
| GET | `/api/proyectos/:id/archivos/:archivoId` | público | Contenido de un archivo |
| POST | `/api/proyectos` | token | Crea un proyecto con archivos (multipart) |
| PATCH | `/api/proyectos/:id` | token | Edita metadatos (JSON) |
| PUT | `/api/proyectos/:id/archivos` | token | Reemplaza todos los archivos (multipart) |
| DELETE | `/api/proyectos/:id` | token | Elimina el proyecto y sus archivos |
| GET | `/api/proyectos/:id/tareas` | token | Tareas del proyecto |
| POST | `/api/proyectos/:id/tareas` | token | Crea una tarea (`titulo`) |
| PATCH | `/api/proyectos/:id/tareas/:tareaId` | token | Marca como hecha (`completada`) o cambia el título |
| DELETE | `/api/proyectos/:id/tareas/:tareaId` | token | Elimina una tarea |

## Estructura

```
backend/
├── index.js              # Arranque: Express, conexión a MongoDB, manejo de errores
├── filtros.js            # Qué carpetas y archivos se ignoran al subir
├── models/
│   ├── Tarea.js          # Tareas pendientes de cada proyecto
│   ├── Proyecto.js       # Proyectos (slug, destacado, estado, fecha)
│   ├── Archivo.js        # Archivos de cada proyecto
│   └── Perfil.js         # Datos de "Sobre mí" (un solo documento)
├── middleware/
│   └── auth.js           # Exige token JWT en las rutas protegidas
├── utils/
│   └── slug.js           # Genera slugs únicos
├── scripts/
│   └── crear-hash.js     # Genera el hash de la contraseña de admin
├── routes/
│   ├── auth.js           # Login y sesión
│   ├── perfil.js         # Endpoints de /api/perfil
│   └── proyectos.js      # Endpoints de /api/proyectos
├── .env.example
└── package.json
```

## Problemas frecuentes

- **`ECONNREFUSED 127.0.0.1:27017`**: MongoDB no está corriendo. Revisa el contenedor de Docker o el servicio de Windows.
- **`Authentication failed`**: la cadena de conexión tiene usuario o contraseña incorrectos (común en Atlas).
- **No veo la base `proyectos_app` en Compass**: súbete un proyecto primero; la base se crea al primer guardado.
- **`413` al subir**: algún archivo supera 10 MB (el límite de Multer). Los archivos mayores a 1 MB de texto se omiten igualmente.
