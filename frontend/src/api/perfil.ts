import { enviarJson, peticion } from './cliente'

export interface Perfil {
  nombre: string
  titulo: string
  bio: string
  habilidades: string[]
  enlaces: {
    github: string
    linkedin: string
    email: string
  }
  tieneFoto: boolean
  tieneCv: boolean
  cvNombre: string
  updatedAt?: string
}

const BASE = '/api/perfil'

export const perfilApi = {
  obtener: () => peticion<Perfil>(BASE),
  guardar: (perfil: Perfil) => peticion<Perfil>(BASE, enviarJson('PUT', perfil)),

  subirFoto: (archivo: File) => {
    const formulario = new FormData()
    formulario.append('foto', archivo)
    return peticion<{ tieneFoto: boolean }>(`${BASE}/foto`, { method: 'PUT', body: formulario })
  },
  eliminarFoto: () => peticion<void>(`${BASE}/foto`, { method: 'DELETE' }),

  subirCv: (archivo: File) => {
    const formulario = new FormData()
    formulario.append('cv', archivo)
    return peticion<{ tieneCv: boolean; cvNombre: string }>(`${BASE}/cv`, { method: 'PUT', body: formulario })
  },
  eliminarCv: () => peticion<void>(`${BASE}/cv`, { method: 'DELETE' }),
}

// La fecha de actualización cambia al subir o editar el perfil, así el navegador no usa una foto vieja
export function urlFoto(perfil: Perfil): string {
  return `${BASE}/foto?v=${encodeURIComponent(perfil.updatedAt ?? '')}`
}

export const urlCv = `${BASE}/cv`
