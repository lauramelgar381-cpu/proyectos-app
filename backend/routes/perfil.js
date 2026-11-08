import { Router } from 'express'
import multer from 'multer'
import Perfil from '../models/Perfil.js'
import { requerirAuth } from '../middleware/auth.js'
import { tipoImagen } from '../utils/imagen.js'

const router = Router()

const TAMANO_FOTO = 2 * 1024 * 1024
const TAMANO_CV = 5 * 1024 * 1024

const subidaFoto = multer({ storage: multer.memoryStorage(), limits: { fileSize: TAMANO_FOTO, files: 1 } })
const subidaCv = multer({ storage: multer.memoryStorage(), limits: { fileSize: TAMANO_CV, files: 1 } })

const PERFIL_VACIO = {
  nombre: 'Laura Melgar',
  titulo: '',
  bio: '',
  habilidades: [],
  enlaces: { github: '', linkedin: '', email: '' },
  tieneFoto: false,
  tieneCv: false,
  cvNombre: '',
}

function listaDesdeTexto(valor) {
  return [].concat(valor ?? [])
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

// Indica al frontend si hay foto o CV sin enviar sus bytes
function respuestaPerfil(perfil) {
  return {
    ...perfil,
    tieneFoto: Boolean(perfil.fotoTipo),
    tieneCv: Boolean(perfil.cvNombre),
    fotoDatos: undefined,
    cvDatos: undefined,
  }
}


function esPdf(buffer) {
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-'
}

// ---------- Datos del perfil ----------

router.get('/', async (req, res) => {
  const perfil = await Perfil.findOne({ clave: 'principal' }).lean()
  if (!perfil) return res.json(PERFIL_VACIO)
  res.json(respuestaPerfil(perfil))
})

router.put('/', requerirAuth, async (req, res) => {
  const cuerpo = req.body ?? {}
  const enlaces = cuerpo.enlaces ?? {}

  const perfil = await Perfil.findOneAndUpdate(
    { clave: 'principal' },
    {
      $set: {
        nombre: String(cuerpo.nombre ?? '').trim(),
        titulo: String(cuerpo.titulo ?? '').trim(),
        bio: String(cuerpo.bio ?? '').trim(),
        habilidades: listaDesdeTexto(cuerpo.habilidades),
        enlaces: {
          github: String(enlaces.github ?? '').trim(),
          linkedin: String(enlaces.linkedin ?? '').trim(),
          email: String(enlaces.email ?? '').trim(),
        },
      },
    },
    { upsert: true, new: true, runValidators: true },
  ).lean()

  res.json(respuestaPerfil(perfil))
})

// ---------- Foto de perfil ----------

router.put('/foto', requerirAuth, subidaFoto.single('foto'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Selecciona una imagen' })
  }

  const tipo = tipoImagen(req.file.buffer)
  if (!tipo) {
    return res.status(400).json({ error: 'Formato no válido. Usa JPG, PNG o WEBP.' })
  }

  await Perfil.findOneAndUpdate(
    { clave: 'principal' },
    { $set: { fotoDatos: req.file.buffer, fotoTipo: tipo } },
    { upsert: true },
  )
  res.json({ tieneFoto: true })
})

router.get('/foto', async (req, res) => {
  const perfil = await Perfil.findOne({ clave: 'principal' }).select('+fotoDatos fotoTipo')
  if (!perfil?.fotoDatos) {
    return res.status(404).json({ error: 'Este perfil no tiene foto' })
  }

  res.type(perfil.fotoTipo)
  res.set('Cache-Control', 'public, max-age=3600')
  res.send(perfil.fotoDatos)
})

router.delete('/foto', requerirAuth, async (req, res) => {
  await Perfil.updateOne({ clave: 'principal' }, { $unset: { fotoDatos: '', fotoTipo: '' } })
  res.status(204).end()
})

// ---------- CV en PDF ----------

router.put('/cv', requerirAuth, subidaCv.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Selecciona un archivo PDF' })
  }
  if (!esPdf(req.file.buffer)) {
    return res.status(400).json({ error: 'El archivo no es un PDF válido' })
  }

  const nombre = (req.file.originalname || 'cv.pdf').replace(/[^\w.\- ]/g, '_')
  await Perfil.findOneAndUpdate(
    { clave: 'principal' },
    { $set: { cvDatos: req.file.buffer, cvNombre: nombre } },
    { upsert: true },
  )
  res.json({ tieneCv: true, cvNombre: nombre })
})

router.get('/cv', async (req, res) => {
  const perfil = await Perfil.findOne({ clave: 'principal' }).select('+cvDatos cvNombre')
  if (!perfil?.cvDatos) {
    return res.status(404).json({ error: 'Este perfil no tiene CV' })
  }

  res.type('application/pdf')
  res.set('Content-Disposition', `inline; filename="${perfil.cvNombre}"`)
  res.send(perfil.cvDatos)
})

router.delete('/cv', requerirAuth, async (req, res) => {
  await Perfil.updateOne({ clave: 'principal' }, { $unset: { cvDatos: '', cvNombre: '' } })
  res.status(204).end()
})

export default router
