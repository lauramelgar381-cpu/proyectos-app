import { Router } from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import Proyecto from '../models/Proyecto.js'
import Archivo from '../models/Archivo.js'
import Tarea from '../models/Tarea.js'
import { requerirAuth } from '../middleware/auth.js'
import { slugUnico } from '../utils/slug.js'
import { tipoImagen } from '../utils/imagen.js'
import {
  MAX_ARCHIVO_BYTES,
  esContenidoTexto,
  esRutaIgnorada,
  normalizarRuta,
} from '../filtros.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5000 },
})

const subidaPortada = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024, files: 1 } })

const LOTE_INSERCION = 500
const ORDENES = {
  reciente: { createdAt: -1 },
  antiguo: { createdAt: 1 },
  nombre: { nombre: 1 },
}

const esObjectId = (valor) => /^[a-f\d]{24}$/i.test(valor)
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function listaDesdeTexto(valor) {
  return [].concat(valor ?? [])
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

// Solo copia los campos que llegan, así PATCH no borra lo que no se envía
function leerMetadatos(cuerpo) {
  const datos = {}

  if (cuerpo.nombre !== undefined) datos.nombre = String(cuerpo.nombre).trim()
  if (cuerpo.descripcion !== undefined) datos.descripcion = String(cuerpo.descripcion).trim()
  if (cuerpo.tecnologias !== undefined) datos.tecnologias = listaDesdeTexto(cuerpo.tecnologias)
  if (cuerpo.githubUrl !== undefined) datos.githubUrl = String(cuerpo.githubUrl).trim()
  if (cuerpo.demoUrl !== undefined) datos.demoUrl = String(cuerpo.demoUrl).trim()
  if (cuerpo.imagenPortada !== undefined) datos.imagenPortada = String(cuerpo.imagenPortada).trim()
  if (cuerpo.destacado !== undefined) datos.destacado = [true, 'true', 'on', '1'].includes(cuerpo.destacado)
  if (cuerpo.estado !== undefined) datos.estado = cuerpo.estado
  if (cuerpo.fechaProyecto !== undefined) {
    datos.fechaProyecto = cuerpo.fechaProyecto ? new Date(cuerpo.fechaProyecto) : null
  }

  return datos
}

// Busca por id o por slug. Devuelve el documento o null
async function buscarProyecto(identificador) {
  const filtro = esObjectId(identificador) ? { _id: identificador } : { slug: identificador }
  return Proyecto.findOne(filtro)
}

// Construye los documentos de Archivo a partir de los archivos subidos.
// `rutas` llega como campo de texto (conserva tildes); el nombre del archivo es respaldo
function prepararArchivos(proyectoId, archivos, rutas) {
  const documentos = []
  let tamanoTotal = 0

  archivos.forEach((archivo, i) => {
    const ruta = normalizarRuta(rutas[i] ?? archivo.originalname)

    if (!ruta || esRutaIgnorada(ruta)) return
    if (archivo.size > MAX_ARCHIVO_BYTES || !esContenidoTexto(archivo.buffer)) return

    documentos.push({
      proyecto: proyectoId,
      ruta,
      contenido: archivo.buffer.toString('utf8'),
      tamano: archivo.size,
    })
    tamanoTotal += archivo.size
  })

  return { documentos, tamanoTotal }
}

async function insertarArchivos(documentos) {
  const ids = []
  for (let i = 0; i < documentos.length; i += LOTE_INSERCION) {
    const insertados = await Archivo.insertMany(documentos.slice(i, i + LOTE_INSERCION), { ordered: false })
    ids.push(...insertados.map((archivo) => archivo._id))
  }
  return ids
}

// ---------- Rutas públicas ----------

// Listado con búsqueda, filtros y orden
router.get('/', async (req, res) => {
  const filtro = {}
  const { q, tecnologia, orden, destacados } = req.query

  if (q) {
    const patron = new RegExp(escaparRegex(String(q)), 'i')
    filtro.$or = [{ nombre: patron }, { descripcion: patron }, { tecnologias: patron }]
  }
  if (tecnologia) {
    filtro.tecnologias = new RegExp(`^${escaparRegex(String(tecnologia))}$`, 'i')
  }
  if (destacados === '1') {
    filtro.destacado = true
  }

  // Sin .lean(): así Mongoose aplica los valores por defecto a proyectos antiguos
  const proyectos = await Proyecto.find(filtro).sort(ORDENES[orden] ?? ORDENES.reciente)
  res.json(proyectos)
})

// Tecnologías con el número de proyectos que las usan
router.get('/tecnologias', async (req, res) => {
  const tecnologias = await Proyecto.aggregate([
    { $unwind: '$tecnologias' },
    { $group: { _id: '$tecnologias', total: { $sum: 1 } } },
    { $sort: { total: -1, _id: 1 } },
    { $project: { _id: 0, nombre: '$_id', total: 1 } },
  ])
  res.json(tecnologias)
})

// Totales y top de tecnologías para la portada
router.get('/estadisticas', async (req, res) => {
  const [totales] = await Proyecto.aggregate([
    {
      $group: {
        _id: null,
        proyectos: { $sum: 1 },
        archivos: { $sum: '$totalArchivos' },
        tamanoTotal: { $sum: '$tamanoTotal' },
      },
    },
  ])

  const tecnologias = await Proyecto.aggregate([
    { $unwind: '$tecnologias' },
    { $group: { _id: '$tecnologias', total: { $sum: 1 } } },
    { $sort: { total: -1, _id: 1 } },
    { $project: { _id: 0, nombre: '$_id', total: 1 } },
  ])

  res.json({
    proyectos: totales?.proyectos ?? 0,
    archivos: totales?.archivos ?? 0,
    tamanoTotal: totales?.tamanoTotal ?? 0,
    tecnologias: tecnologias.length,
    topTecnologias: tecnologias.slice(0, 8),
  })
})

// Detalle del proyecto con la lista de archivos (sin contenido)
router.get('/:id', async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const archivos = await Archivo.find({ proyecto: proyecto._id }, { contenido: 0 })
    .sort({ ruta: 1 })
    .lean()
  res.json({ ...proyecto.toJSON(), archivos })
})

// README.md de la raíz del proyecto, si existe
router.get('/:id/readme', async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const readme = await Archivo.findOne({ proyecto: proyecto._id, ruta: /^readme\.md$/i }).lean()
  if (!readme) {
    return res.status(404).json({ error: 'Este proyecto no tiene README' })
  }

  res.json({ ruta: readme.ruta, contenido: readme.contenido })
})

// Contenido de un archivo concreto
router.get('/:id/archivos/:archivoId', async (req, res) => {
  const { id, archivoId } = req.params
  if (!esObjectId(archivoId)) {
    return res.status(400).json({ error: 'Id no válido' })
  }

  const proyecto = await buscarProyecto(id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const archivo = await Archivo.findOne({ _id: archivoId, proyecto: proyecto._id }).lean()
  if (!archivo) {
    return res.status(404).json({ error: 'Archivo no encontrado' })
  }

  res.json(archivo)
})

// ---------- Rutas protegidas (requieren sesión) ----------

// Crea el proyecto. Multipart: campos de texto, `rutas` (una por archivo) y `archivos`
router.post('/', requerirAuth, upload.array('archivos'), async (req, res) => {
  const cuerpo = req.body ?? {}
  const nombre = String(cuerpo.nombre ?? '').trim()
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  const proyectoId = new mongoose.Types.ObjectId()
  const { documentos, tamanoTotal } = prepararArchivos(
    proyectoId,
    req.files ?? [],
    [].concat(cuerpo.rutas ?? []),
  )

  // Sin carpeta hace falta un enlace de GitHub; con carpeta, el enlace es opcional
  const githubUrl = String(cuerpo.githubUrl ?? '').trim()
  if (documentos.length === 0 && !githubUrl) {
    return res.status(400).json({
      error: 'Sube la carpeta del proyecto o indica el enlace de GitHub',
    })
  }
  if (githubUrl && !/^https?:\/\//i.test(githubUrl)) {
    return res.status(400).json({ error: 'El enlace de GitHub debe empezar por https://' })
  }

  const proyecto = await Proyecto.create({
    ...leerMetadatos(cuerpo),
    _id: proyectoId,
    slug: await slugUnico(nombre),
    nombre,
    totalArchivos: documentos.length,
    tamanoTotal,
  })

  try {
    if (documentos.length > 0) await insertarArchivos(documentos)
  } catch (error) {
    // Evita dejar un proyecto a medias si falla la inserción de archivos
    await Archivo.deleteMany({ proyecto: proyectoId })
    await Proyecto.deleteOne({ _id: proyectoId })
    throw error
  }

  res.status(201).json(proyecto)
})

// Edita metadatos (JSON). No toca los archivos
router.patch('/:id', requerirAuth, async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const datos = leerMetadatos(req.body ?? {})
  if (Object.keys(datos).length === 0) {
    return res.status(400).json({ error: 'No hay cambios que guardar' })
  }

  const actualizado = await Proyecto.findByIdAndUpdate(
    proyecto._id,
    { $set: datos },
    { new: true, runValidators: true },
  )
  res.json(actualizado)
})

// Reemplaza los archivos del proyecto (multipart). Inserta primero y borra los antiguos después,
// así un fallo a mitad no deja el proyecto sin archivos
router.put('/:id/archivos', requerirAuth, upload.array('archivos'), async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const { documentos, tamanoTotal } = prepararArchivos(
    proyecto._id,
    req.files ?? [],
    [].concat(req.body?.rutas ?? []),
  )
  if (documentos.length === 0) {
    return res.status(400).json({ error: 'No se encontraron archivos de texto válidos para guardar' })
  }

  const idsNuevos = await insertarArchivos(documentos)
  await Archivo.deleteMany({ proyecto: proyecto._id, _id: { $nin: idsNuevos } })

  const actualizado = await Proyecto.findByIdAndUpdate(
    proyecto._id,
    { $set: { totalArchivos: documentos.length, tamanoTotal } },
    { new: true },
  )
  res.json(actualizado)
})

router.delete('/:id', requerirAuth, async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  await Proyecto.deleteOne({ _id: proyecto._id })
  await Archivo.deleteMany({ proyecto: proyecto._id })
  await Tarea.deleteMany({ proyecto: proyecto._id })
  res.status(204).end()
})

// ---------- Tareas de un proyecto (requieren sesión) ----------

router.get('/:id/tareas', requerirAuth, async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const tareas = await Tarea.find({ proyecto: proyecto._id }).sort({ completada: 1, createdAt: 1 }).lean()
  res.json(tareas)
})

router.post('/:id/tareas', requerirAuth, async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const titulo = String(req.body?.titulo ?? '').trim()
  if (!titulo) {
    return res.status(400).json({ error: 'El título de la tarea es obligatorio' })
  }

  const tarea = await Tarea.create({ proyecto: proyecto._id, titulo })
  res.status(201).json(tarea)
})

// Marca como hecha o pendiente, o cambia el título
router.patch('/:id/tareas/:tareaId', requerirAuth, async (req, res) => {
  const { id, tareaId } = req.params
  if (!esObjectId(tareaId)) {
    return res.status(400).json({ error: 'Id no válido' })
  }

  const proyecto = await buscarProyecto(id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const datos = {}
  if (req.body?.completada !== undefined) datos.completada = [true, 'true', 1, '1'].includes(req.body.completada)
  if (req.body?.titulo !== undefined) datos.titulo = String(req.body.titulo).trim()

  const tarea = await Tarea.findOneAndUpdate(
    { _id: tareaId, proyecto: proyecto._id },
    { $set: datos },
    { new: true, runValidators: true },
  ).lean()
  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' })
  }
  res.json(tarea)
})

router.delete('/:id/tareas/:tareaId', requerirAuth, async (req, res) => {
  const { id, tareaId } = req.params
  if (!esObjectId(tareaId)) {
    return res.status(400).json({ error: 'Id no válido' })
  }

  const proyecto = await buscarProyecto(id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const eliminada = await Tarea.deleteOne({ _id: tareaId, proyecto: proyecto._id })
  if (eliminada.deletedCount === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' })
  }
  res.status(204).end()
})

// ---------- Portada (imagen subida) ----------

router.get('/:id/portada', async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const conPortada = await Proyecto.findById(proyecto._id).select('+portadaDatos portadaTipo')
  if (!conPortada?.portadaDatos) {
    return res.status(404).json({ error: 'Este proyecto no tiene portada' })
  }

  res.type(conPortada.portadaTipo)
  res.set('Cache-Control', 'public, max-age=3600')
  res.send(conPortada.portadaDatos)
})

router.put('/:id/portada', requerirAuth, subidaPortada.single('portada'), async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Selecciona una imagen' })
  }

  const tipo = tipoImagen(req.file.buffer)
  if (!tipo) {
    return res.status(400).json({ error: 'Formato no válido. Usa JPG, PNG o WEBP.' })
  }

  const actualizado = await Proyecto.findByIdAndUpdate(
    proyecto._id,
    { $set: { portadaDatos: req.file.buffer, portadaTipo: tipo } },
    { new: true },
  )
  res.json(actualizado)
})

router.delete('/:id/portada', requerirAuth, async (req, res) => {
  const proyecto = await buscarProyecto(req.params.id)
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  await Proyecto.updateOne({ _id: proyecto._id }, { $unset: { portadaDatos: '', portadaTipo: '' } })
  res.status(204).end()
})

export default router
