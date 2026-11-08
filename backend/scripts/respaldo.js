// Crea una copia de seguridad de todas las colecciones en un archivo JSON.
// Uso: npm run respaldo
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { config } from 'dotenv'
import mongoose from 'mongoose'
import { EJSON } from 'bson'

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyectos_app'
const CARPETA = process.env.BACKUP_DIR || fileURLToPath(new URL('../../backups', import.meta.url))
const CONSERVAR = Number(process.env.BACKUP_CONSERVAR || 14)

function marcaDeTiempo() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

async function borrarAntiguos() {
  const archivos = (await readdir(CARPETA)).filter((nombre) => nombre.startsWith('respaldo-')).sort()
  const sobrantes = archivos.slice(0, Math.max(0, archivos.length - CONSERVAR))
  for (const nombre of sobrantes) {
    await rm(join(CARPETA, nombre))
  }
  return sobrantes.length
}

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  const db = mongoose.connection.db

  const colecciones = {}
  for (const { name } of await db.listCollections().toArray()) {
    if (name.startsWith('system.')) continue
    colecciones[name] = await db.collection(name).find({}).toArray()
  }

  // EJSON guarda fechas, ids y archivos binarios (fotos y CV) sin perder su tipo
  const contenido = EJSON.stringify({
    creado: new Date(),
    base: mongoose.connection.name,
    colecciones,
  })

  await mkdir(CARPETA, { recursive: true })
  const archivo = join(CARPETA, `respaldo-${marcaDeTiempo()}.json`)
  await writeFile(archivo, contenido)

  const resumen = Object.entries(colecciones)
    .map(([nombre, docs]) => `${nombre}: ${docs.length}`)
    .join(', ')
  const eliminados = await borrarAntiguos()

  console.log(`Respaldo creado: ${archivo}`)
  console.log(`Documentos -> ${resumen}`)
  if (eliminados) console.log(`Se eliminaron ${eliminados} respaldos antiguos (se conservan ${CONSERVAR}).`)
} catch (error) {
  console.error('No se pudo crear el respaldo:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
