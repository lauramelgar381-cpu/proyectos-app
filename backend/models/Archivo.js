import mongoose from 'mongoose'

const archivoSchema = new mongoose.Schema({
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  ruta: { type: String, required: true },
  contenido: { type: String, default: '' },
  tamano: { type: Number, default: 0 },
})

archivoSchema.index({ proyecto: 1, ruta: 1 })

export default mongoose.model('Archivo', archivoSchema)
