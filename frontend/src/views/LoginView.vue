<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mensajeDeError } from '@/api/cliente'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const usuario = ref('')
const password = ref('')
const verPassword = ref(false)
const error = ref('')
const cargando = ref(false)

async function entrar() {
  error.value = ''
  cargando.value = true

  try {
    await auth.iniciarSesion(usuario.value.trim(), password.value)

    // Solo se acepta una ruta interna para evitar redirecciones a otros sitios
    const destino = String(route.query.redirect ?? '')
    const esInterna = destino.startsWith('/') && !destino.startsWith('//')
    // Tras iniciar sesión pasa por la bienvenida, que lleva al panel
    router.push({ name: 'bienvenida', query: { destino: esInterna ? destino : '/admin/proyectos' } })
  } catch (e) {
    error.value = mensajeDeError(e)
    password.value = ''
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/15 via-base-100 to-secondary/15">
    <div class="w-full max-w-md space-y-6">
      <div class="card bg-base-100 shadow-2xl border border-base-300">
        <form class="card-body gap-5 p-8" @submit.prevent="entrar">
          <div class="text-center space-y-2">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-7 w-7" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold">Iniciar sesión</h1>
            <p class="text-sm opacity-60">Accede para administrar tus proyectos</p>
          </div>

          <div v-if="error" class="alert alert-error text-sm">
            <span>{{ error }}</span>
          </div>

          <label class="form-control w-full">
            <span class="label-text font-semibold mb-2">Usuario</span>
            <label class="input input-bordered input-lg flex items-center gap-3 w-full bg-base-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5 opacity-50 shrink-0" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <input v-model="usuario" type="text" autocomplete="username" class="grow bg-transparent outline-none" placeholder="Tu usuario" required />
            </label>
          </label>

          <label class="form-control w-full">
            <span class="label-text font-semibold mb-2">Contraseña</span>
            <label class="input input-bordered input-lg flex items-center gap-3 w-full bg-base-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5 opacity-50 shrink-0" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input
                v-model="password"
                :type="verPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="grow bg-transparent outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-circle"
                :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :title="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="verPassword = !verPassword"
              >
                <svg v-if="!verPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </label>
          </label>

          <button type="submit" class="btn btn-primary btn-lg w-full mt-2" :disabled="cargando">
            <span v-if="cargando" class="loading loading-spinner"></span>
            Entrar
          </button>
        </form>
      </div>

      <p class="text-center text-xs opacity-50">Acceso privado · solo para el administrador del sitio</p>
    </div>
  </main>
</template>
