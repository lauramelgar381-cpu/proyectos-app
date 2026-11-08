const CLAVE_TOKEN = 'token'

export class ErrorApi extends Error {
  estado: number

  constructor(mensaje: string, estado: number) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // Sin almacenamiento disponible (p. ej. ventana privada): la sesión dura solo mientras la pestaña esté abierta
  }
}

// Envía la petición con el token de sesión (si existe) y convierte los errores en mensajes legibles
export async function peticion<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const cabeceras = new Headers(opciones.headers)
  const token = leerToken()
  if (token) cabeceras.set('Authorization', `Bearer ${token}`)

  let respuesta: Response
  try {
    respuesta = await fetch(url, { ...opciones, headers: cabeceras })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.')
  }

  if (respuesta.status === 204) return undefined as T

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new ErrorApi(datos.error ?? `Error ${respuesta.status}`, respuesta.status)
  }
  return datos as T
}

export function enviarJson(metodo: string, cuerpo: unknown): RequestInit {
  return {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  }
}

export function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido'
}
