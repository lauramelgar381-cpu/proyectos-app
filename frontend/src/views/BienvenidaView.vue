<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { perfilApi, urlFoto, type Perfil } from '@/api/perfil'
import { useAuthStore } from '@/stores/auth'

const SEGUNDOS_ANTES_DE_ENTRAR = 5

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const perfil = ref<Perfil | null>(null)

// Al llegar desde el login, la bienvenida avanza sola al panel después de unos segundos
const destino = String(route.query.destino ?? '')
const llegoDesdeLogin = destino !== '' && auth.autenticado
const segundos = ref(SEGUNDOS_ANTES_DE_ENTRAR)
let temporizador: number | undefined

const inicial = computed(() => perfil.value?.nombre.charAt(0).toUpperCase() || '?')

function entrarAlPanel() {
  clearInterval(temporizador)
  router.push(destino.startsWith('/') && !destino.startsWith('//') ? destino : { name: 'admin-proyectos' })
}

onMounted(() => {
  perfilApi
    .obtener()
    .then((datos) => (perfil.value = datos))
    .catch(() => {
      // Sin perfil, la bienvenida muestra un texto genérico
    })

  if (llegoDesdeLogin) {
    temporizador = window.setInterval(() => {
      segundos.value--
      if (segundos.value <= 0) entrarAlPanel()
    }, 1000)
  }
})

onBeforeUnmount(() => clearInterval(temporizador))
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/15 via-base-100 to-secondary/15">
    <div class="w-full max-w-xl text-center space-y-8">
      <div class="avatar mx-auto">
        <div class="w-36 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 bg-base-200 shadow-xl">
          <img v-if="perfil?.tieneFoto" :src="urlFoto(perfil)" :alt="perfil.nombre" />
          <span v-else class="flex h-full items-center justify-center text-5xl font-bold opacity-40">{{ inicial }}</span>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Bienvenido</p>
        <h1 class="text-4xl md:text-5xl font-bold leading-tight">{{ perfil?.nombre || 'Mi portafolio' }}</h1>
        <p v-if="perfil?.titulo" class="text-lg opacity-70">{{ perfil.titulo }}</p>
      </div>

      <template v-if="llegoDesdeLogin">
        <p class="opacity-60">Entrando al panel en {{ segundos }} s…</p>
        <div class="flex flex-col sm:flex-row justify-center gap-3">
          <button type="button" class="btn btn-primary btn-lg px-10" @click="entrarAlPanel">Ir a mis proyectos</button>
        </div>
      </template>

      <div v-else class="flex flex-col sm:flex-row justify-center gap-3">
        <RouterLink v-if="auth.autenticado" :to="{ name: 'admin-proyectos' }" class="btn btn-primary btn-lg px-10">
          Ir a mis proyectos
        </RouterLink>
        <RouterLink v-else :to="{ name: 'login' }" class="btn btn-primary btn-lg px-10">Continuar</RouterLink>
        <RouterLink :to="{ name: 'inicio' }" class="btn btn-ghost btn-lg">Ver el sitio</RouterLink>
      </div>
    </div>
  </main>
</template>
