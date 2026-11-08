// Mismas reglas que server/filtros.js, para no enviar node_modules ni .git al servidor
const CARPETAS_IGNORADAS = new Set([
  'node_modules',
  '.git',
  '.svn',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '__pycache__',
  '.venv',
  'venv',
  '.idea',
  '.vscode',
])

const ARCHIVOS_IGNORADOS = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.DS_Store)$/

const TAMANO_MAXIMO = 1024 * 1024

// Quita el nombre de la carpeta elegida para que las rutas empiecen dentro del proyecto
export function rutaDeArchivo(archivo: File): string {
  const relativa = archivo.webkitRelativePath
  if (!relativa) return archivo.name
  return relativa.split('/').slice(1).join('/')
}

export function debeIgnorarse(ruta: string, tamano: number): boolean {
  if (!ruta || tamano > TAMANO_MAXIMO) return true
  const carpetas = ruta.split('/').slice(0, -1)
  if (carpetas.some((carpeta) => CARPETAS_IGNORADAS.has(carpeta))) return true
  return ARCHIVOS_IGNORADOS.test(ruta)
}

export function formatoTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatoFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
