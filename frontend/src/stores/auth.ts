import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { guardarToken, leerToken } from '@/api/cliente'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(leerToken())
  const usuario = ref('')
  const autenticado = computed(() => token.value !== null)

  async function iniciarSesion(nombreUsuario: string, password: string) {
    const respuesta = await authApi.login(nombreUsuario, password)
    token.value = respuesta.token
    usuario.value = respuesta.usuario
    guardarToken(respuesta.token)
  }

  function cerrarSesion() {
    token.value = null
    usuario.value = ''
    guardarToken(null)
  }

  return { token, usuario, autenticado, iniciarSesion, cerrarSesion }
})
