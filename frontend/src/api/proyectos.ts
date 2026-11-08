import { enviarJson, peticion } from './cliente'

export { mensajeDeError } from './cliente'

export type EstadoProyecto = 'en progreso' | 'terminado'

export interface Proyecto {
  _id: string
  slug?: string
  nombre: string
  descripcion: string
  tecnologias: string[]
  githubUrl: string
  demoUrl: string
  imagenPortada: string
  tienePortada: boolean
  destacado: boolean
  estado: EstadoProyecto
  fechaProyecto: string | null
  totalArchivos: number
  tamanoTotal: number
  createdAt: string
  updatedAt: string
}

export interface ArchivoResumen {
  _id: string
  ruta: string
  tamano: number
}

export interface ProyectoDetalle extends Proyecto {
  archivos: ArchivoResumen[]
}

export interface ArchivoContenido extends ArchivoResumen {
  proyecto: string
  contenido: string
}

export interface Readme {
  ruta: string
  contenido: string
}

export interface TecnologiaContada {
  nombre: string
  total: number
}

export interface Estadisticas {
  proyectos: number
  archivos: number
  tamanoTotal: number
  tecnologias: number
  topTecnologias: TecnologiaContada[]
}

export interface ParamsListado {
  q?: string
  tecnologia?: string
  orden?: 'reciente' | 'antiguo' | 'nombre'
  destacados?: boolean
}

const BASE = '/api/proyectos'

function queryString(params: ParamsListado): string {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.tecnologia) query.set('tecnologia', params.tecnologia)
  if (params.orden) query.set('orden', params.orden)
  if (params.destacados) query.set('destacados', '1')

  const texto = query.toString()
  return texto ? `?${texto}` : ''
}

export interface Tarea {
  _id: string
  proyecto: string
  titulo: string
  completada: boolean
}

export const api = {
  listar: (params: ParamsListado = {}) => peticion<Proyecto[]>(`${BASE}${queryString(params)}`),
  tareas: (id: string) => peticion<Tarea[]>(`${BASE}/${id}/tareas`),
  crearTarea: (id: string, titulo: string) =>
    peticion<Tarea>(`${BASE}/${id}/tareas`, enviarJson('POST', { titulo })),
  actualizarTarea: (id: string, tareaId: string, datos: Partial<Pick<Tarea, 'titulo' | 'completada'>>) =>
    peticion<Tarea>(`${BASE}/${id}/tareas/${tareaId}`, enviarJson('PATCH', datos)),
  eliminarTarea: (id: string, tareaId: string) =>
    peticion<void>(`${BASE}/${id}/tareas/${tareaId}`, { method: 'DELETE' }),
  obtener: (id: string) => peticion<ProyectoDetalle>(`${BASE}/${id}`),
  archivo: (id: string, archivoId: string) =>
    peticion<ArchivoContenido>(`${BASE}/${id}/archivos/${archivoId}`),
  readme: (id: string) => peticion<Readme>(`${BASE}/${id}/readme`),
  tecnologias: () => peticion<TecnologiaContada[]>(`${BASE}/tecnologias`),
  estadisticas: () => peticion<Estadisticas>(`${BASE}/estadisticas`),
  crear: (formulario: FormData) => peticion<Proyecto>(BASE, { method: 'POST', body: formulario }),
  actualizar: (id: string, datos: Record<string, unknown>) =>
    peticion<Proyecto>(`${BASE}/${id}`, enviarJson('PATCH', datos)),
  reemplazarArchivos: (id: string, formulario: FormData) =>
    peticion<Proyecto>(`${BASE}/${id}/archivos`, { method: 'PUT', body: formulario }),
  subirPortada: (id: string, archivo: File) => {
    const formulario = new FormData()
    formulario.append('portada', archivo)
    return peticion<Proyecto>(`${BASE}/${id}/portada`, { method: 'PUT', body: formulario })
  },
  eliminarPortada: (id: string) => peticion<void>(`${BASE}/${id}/portada`, { method: 'DELETE' }),
  eliminar: (id: string) => peticion<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}

// La fecha de actualización cambia al subir la portada, así el navegador no muestra una imagen vieja
export function urlPortada(proyecto: Proyecto): string {
  return `${BASE}/${proyecto._id}/portada?v=${encodeURIComponent(proyecto.updatedAt)}`
}
