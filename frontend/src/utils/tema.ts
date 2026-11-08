export const TEMAS = {
  claro: 'portafolio-claro',
  oscuro: 'portafolio-oscuro',
} as const

const CLAVE = 'tema'

// Recuerda la elección del usuario en este navegador. Si no hay almacenamiento, usa el claro
export function temaGuardado(): string {
  try {
    const guardado = localStorage.getItem(CLAVE)
    return guardado === TEMAS.oscuro ? TEMAS.oscuro : TEMAS.claro
  } catch {
    return TEMAS.claro
  }
}

export function aplicarTema(tema: string): void {
  document.documentElement.setAttribute('data-theme', tema)
  try {
    localStorage.setItem(CLAVE, tema)
  } catch {
    // Sin almacenamiento disponible, el tema solo dura mientras la pestaña esté abierta
  }
}

export function temaActual(): string {
  return document.documentElement.getAttribute('data-theme') ?? TEMAS.claro
}
