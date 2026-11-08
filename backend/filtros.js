// Carpetas y archivos que no tiene sentido guardar en la base de datos
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

export const MAX_ARCHIVO_BYTES = 1024 * 1024 // 1 MB por archivo de texto

export function normalizarRuta(ruta) {
  return String(ruta ?? '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .trim()
}

export function esRutaIgnorada(ruta) {
  const partes = ruta.split('/')
  if (partes.includes('..')) return true
  if (partes.slice(0, -1).some((carpeta) => CARPETAS_IGNORADAS.has(carpeta))) return true
  return ARCHIVOS_IGNORADOS.test(ruta)
}

// Un archivo binario (imagen, zip, etc.) contiene bytes nulos en sus primeros bytes
export function esContenidoTexto(buffer) {
  return !buffer.subarray(0, 8000).includes(0)
}
