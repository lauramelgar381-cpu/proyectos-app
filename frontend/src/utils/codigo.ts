import hljs from 'highlight.js/lib/common'
import type { ArchivoResumen } from '@/api/proyectos'

export interface NodoArbol {
  nombre: string
  ruta: string
  carpeta: boolean
  hijos: NodoArbol[]
  archivoId?: string
}

// Extensión -> lenguaje de highlight.js. Lo que no esté aquí se muestra sin colores
const EXTENSIONES: Record<string, string | undefined> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  vue: 'xml',
  html: 'xml',
  htm: 'xml',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  py: 'python',
  java: 'java',
  php: 'php',
  sh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  sql: 'sql',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
}

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function resaltarCodigo(codigo: string, ruta: string): string {
  const extension = ruta.split('.').pop()?.toLowerCase() ?? ''
  const lenguaje = EXTENSIONES[extension]

  if (lenguaje && hljs.getLanguage(lenguaje)) {
    return hljs.highlight(codigo, { language: lenguaje, ignoreIllegals: true }).value
  }
  return escapar(codigo)
}

// Convierte la lista plana de rutas en un árbol: carpetas primero, luego por nombre
export function construirArbol(archivos: ArchivoResumen[]): NodoArbol[] {
  const raiz: NodoArbol[] = []

  for (const archivo of archivos) {
    const partes = archivo.ruta.split('/')
    let nivel = raiz
    let rutaActual = ''

    partes.forEach((parte, indice) => {
      rutaActual = rutaActual ? `${rutaActual}/${parte}` : parte
      const esArchivo = indice === partes.length - 1

      let nodo = nivel.find((n) => n.nombre === parte && n.carpeta === !esArchivo)
      if (!nodo) {
        nodo = {
          nombre: parte,
          ruta: rutaActual,
          carpeta: !esArchivo,
          hijos: [],
          archivoId: esArchivo ? archivo._id : undefined,
        }
        nivel.push(nodo)
      }
      nivel = nodo.hijos
    })
  }

  ordenar(raiz)
  return raiz
}

function ordenar(nodos: NodoArbol[]): void {
  nodos.sort((a, b) => {
    if (a.carpeta !== b.carpeta) return a.carpeta ? -1 : 1
    return a.nombre.localeCompare(b.nombre, 'es')
  })
  nodos.forEach((nodo) => ordenar(nodo.hijos))
}
