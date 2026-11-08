import mongoose from 'mongoose'

// Tareas pendientes de un proyecto (solo visibles en el panel)
const tareaSchema = new mongoose.Schema(
  {
    proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true, index: true },
    titulo: { type: String, required: true, trim: true, maxlength: 200 },
    completada: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('Tarea', tareaSchema)
