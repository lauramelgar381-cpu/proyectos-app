import { marked } from 'marked'
import DOMPurify from 'dompurify'

// El README viene de archivos subidos, así que se limpia antes de mostrarlo (evita XSS)
export function renderizarMarkdown(texto: string): string {
  const html = marked.parse(texto) as string
  return DOMPurify.sanitize(html)
}
