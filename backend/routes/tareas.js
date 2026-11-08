import { Router } from 'express'
import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tarea.js'
import { requerirAuth } from '../middleware/auth.js'

const router = Router()

// Tareas no completadas de los proyectos en progreso, para el menú lateral
router.get('/pendientes', requerirAuth, async (req, res) => {
  const proyectos = await Proyecto.find({ estado: 'en progreso' }, { nombre: 1 }).lean()
  const nombres = new Map(proyectos.map((proyecto) => [String(proyecto._id), proyecto.nombre]))

  const tareas = await Tarea.find({ proyecto: { $in: proyectos.map((p) => p._id) }, completada: false })
    .sort({ createdAt: 1 })
    .lean()

  res.json(
    tareas.map((tarea) => ({
      _id: tarea._id,
      titulo: tarea.titulo,
      proyecto: String(tarea.proyecto),
      proyectoNombre: nombres.get(String(tarea.proyecto)) ?? '',
    })),
  )
})

export default router
