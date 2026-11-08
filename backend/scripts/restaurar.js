// Restaura una copia de seguridad. BORRA el contenido actual de las colecciones que contiene.
// Uso: npm run restaurar -- backups/respaldo-AAAA.json --confirmar
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import mongoose from 'mongoose'
import { EJSON } from 'bson'

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyectos_app'
const [archivo, confirmar] = process.argv.slice(2)

if (!archivo || confirmar !== '--confirmar') {
  console.error('Uso: npm run restaurar -- <archivo.json> --confirmar')
  console.error('Aviso: la restauración reemplaza los datos actuales de la base.')
  process.exit(1)
}

try {
  const copia = EJSON.parse(await readFile(archivo, 'utf8'))
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  const db = mongoose.connection.db

  for (const [nombre, documentos] of Object.entries(copia.colecciones)) {
    await db.collection(nombre).deleteMany({})
    if (documentos.length > 0) {
      await db.collection(nombre).insertMany(documentos)
    }
    console.log(`${nombre}: ${documentos.length} documentos restaurados`)
  }

  console.log(`Restauración completa en la base ${mongoose.connection.name}.`)
} catch (error) {
  console.error('No se pudo restaurar:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
