import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, mensajeDeError, type Proyecto } from '@/api/proyectos'

export const useProyectosStore = defineStore('proyectos', () => {
  const lista = ref<Proyecto[]>([])
  const cargando = ref(false)
  const error = ref('')

  async function cargar() {
    cargando.value = true
    error.value = ''
    try {
      lista.value = await api.listar()
    } catch (e) {
      error.value = mensajeDeError(e)
    } finally {
      cargando.value = false
    }
  }

  async function eliminar(id: string): Promise<boolean> {
    error.value = ''
    try {
      await api.eliminar(id)
      lista.value = lista.value.filter((proyecto) => proyecto._id !== id)
      return true
    } catch (e) {
      error.value = mensajeDeError(e)
      return false
    }
  }

  return { lista, cargando, error, cargar, eliminar }
})
