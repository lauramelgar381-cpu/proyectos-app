import type { Proyecto } from '@/api/proyectos'
import { debeIgnorarse, rutaDeArchivo } from './archivos'

// Campos del formulario de proyecto. Las tecnologías se escriben separadas por coma
export interface CamposProyecto {
  nombre: string
  descripcion: string
  tecnologias: string
  githubUrl: string
  demoUrl: string
  estado: 'en progreso' | 'terminado'
  fechaProyecto: string
  destacado: boolean
}

export function camposVacios(): CamposProyecto {
  return {
    nombre: '',
    descripcion: '',
    tecnologias: '',
    githubUrl: '',
    demoUrl: '',
    estado: 'terminado',
    fechaProyecto: '',
    destacado: false,
  }
}

export function camposDesde(proyecto: Proyecto): CamposProyecto {
  return {
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    tecnologias: proyecto.tecnologias.join(', '),
    githubUrl: proyecto.githubUrl,
    demoUrl: proyecto.demoUrl,
    estado: proyecto.estado,
    fechaProyecto: proyecto.fechaProyecto ? proyecto.fechaProyecto.slice(0, 10) : '',
    destacado: proyecto.destacado,
  }
}

export function anadirCampos(formulario: FormData, campos: CamposProyecto): void {
  formulario.append('nombre', campos.nombre.trim())
  formulario.append('descripcion', campos.descripcion.trim())
  formulario.append('tecnologias', campos.tecnologias)
  formulario.append('githubUrl', campos.githubUrl.trim())
  formulario.append('demoUrl', campos.demoUrl.trim())
  formulario.append('estado', campos.estado)
  formulario.append('fechaProyecto', campos.fechaProyecto)
  formulario.append('destacado', String(campos.destacado))
}

// Añade solo los archivos válidos (sin node_modules, binarios, etc.). Devuelve cuántos añadió
export function anadirArchivos(formulario: FormData, archivos: File[]): number {
  let incluidos = 0

  for (const archivo of archivos) {
    const ruta = rutaDeArchivo(archivo)
    if (debeIgnorarse(ruta, archivo.size)) continue

    formulario.append('rutas', ruta)
    formulario.append('archivos', archivo, archivo.name)
    incluidos++
  }

  return incluidos
}
