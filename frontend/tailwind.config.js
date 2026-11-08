import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'

// Paleta del proyecto. Cada tema define los colores que usan todos los componentes de DaisyUI
const claro = {
  primary: '#4F46E5',
  'primary-content': '#FFFFFF',
  secondary: '#2563EB',
  'secondary-content': '#FFFFFF',
  accent: '#06B6D4',
  'accent-content': '#0F172A',
  neutral: '#172554',
  'neutral-content': '#F8FAFC',
  'base-100': '#FFFFFF', // tarjetas, barra superior y panel lateral
  'base-200': '#F8FAFC', // fondo general
  'base-300': '#E2E8F0', // bordes
  'base-content': '#0F172A', // texto principal
  info: '#0EA5E9',
  'info-content': '#FFFFFF',
  success: '#16A34A',
  'success-content': '#FFFFFF',
  warning: '#F59E0B',
  'warning-content': '#0F172A',
  error: '#DC2626',
  'error-content': '#FFFFFF',
}

const oscuro = {
  primary: '#818CF8',
  'primary-content': '#0B1120',
  secondary: '#3B82F6',
  'secondary-content': '#FFFFFF',
  accent: '#06B6D4',
  'accent-content': '#0B1120',
  neutral: '#293548',
  'neutral-content': '#F8FAFC',
  'base-100': '#172033', // tarjetas
  'base-200': '#0B1120', // fondo general
  'base-300': '#293548', // bordes
  'base-content': '#F8FAFC', // texto principal
  info: '#0EA5E9',
  'info-content': '#0B1120',
  success: '#22C55E',
  'success-content': '#0B1120',
  warning: '#FBBF24',
  'warning-content': '#0B1120',
  error: '#F87171',
  'error-content': '#0B1120',
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui, typography],
  daisyui: {
    themes: [
      { 'portafolio-claro': claro },
      { 'portafolio-oscuro': oscuro },
    ],
  },
}
