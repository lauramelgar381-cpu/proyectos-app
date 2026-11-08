import Proyecto from '../models/Proyecto.js'

// "Mi Proyecto Vue ñandú" -> "mi-proyecto-vue-nandu"
export function crearSlug(texto) {
  const base = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return base || 'proyecto'
}

// Añade un sufijo corto si el slug ya existe, para que sea único
export async function slugUnico(texto) {
  const base = crearSlug(texto)
  const existe = await Proyecto.exists({ slug: base })
  if (!existe) return base

  const sufijo = Math.random().toString(36).slice(2, 6)
  return `${base}-${sufijo}`
}
