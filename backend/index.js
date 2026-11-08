import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { config } from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import authRouter from './routes/auth.js'
import perfilRouter from './routes/perfil.js'
import proyectosRouter from './routes/proyectos.js'

// Lee el .env de esta carpeta, sin importar desde dónde se ejecute el comando
config({ path: fileURLToPath(new URL('.env', import.meta.url)) })

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyectos_app'

const app = express()

app.use(express.json())

// Comprueba que la API responde y que MongoDB está conectada
app.get('/api/salud', (req, res) => {
  const conectada = mongoose.connection.readyState === 1
  res.status(conectada ? 200 : 503).json({
    api: 'ok',
    mongodb: conectada ? 'conectada' : 'desconectada',
    baseDeDatos: mongoose.connection.name,
  })
})

app.use('/api/auth', authRouter)
app.use('/api/perfil', perfilRouter)
app.use('/api/proyectos', proyectosRouter)

// En producción, el mismo servidor entrega la interfaz compilada
const CARPETA_FRONTEND = process.env.FRONTEND_DIST || fileURLToPath(new URL('../frontend/dist', import.meta.url))
if (existsSync(CARPETA_FRONTEND)) {
  app.use(express.static(CARPETA_FRONTEND))

  // Rutas de la aplicación (p. ej. /proyectos/abc): devuelve la interfaz y Vue Router resuelve la vista
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(join(CARPETA_FRONTEND, 'index.html'))
  })
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const estado = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    return res.status(estado).json({ error: `Error al subir archivos: ${err.message}` })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  // Valor con formato incorrecto, p. ej. una fecha no válida
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Valor no válido para ${err.path}` })
  }

  // Errores del cliente, como JSON mal formado (body-parser los marca con `status`)
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  console.log(`MongoDB conectada: ${mongoose.connection.host}/${mongoose.connection.name}`)
} catch (error) {
  console.error('No se pudo conectar a MongoDB. Revisa MONGODB_URI y que el servicio esté activo.')
  console.error(error.message)
  process.exit(1)
}

if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD_HASH) {
  console.warn('Aviso: faltan JWT_SECRET o ADMIN_PASSWORD_HASH; el inicio de sesión no funcionará.')
}

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})
