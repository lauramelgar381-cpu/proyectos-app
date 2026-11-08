<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BotonVolver from '@/components/BotonVolver.vue'
import SelectorTema from '@/components/SelectorTema.vue'
import { perfilApi, type Perfil } from '@/api/perfil'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const perfil = ref<Perfil | null>(null)

onMounted(() => {
  perfilApi
    .obtener()
    .then((datos) => (perfil.value = datos))
    .catch(() => {
      // Sin perfil, el sitio muestra el nombre genérico
    })
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-200 text-base-content">
    <header class="navbar sticky top-0 z-20 bg-base-100/80 backdrop-blur border-b border-base-200 px-4 md:px-8 flex-wrap gap-2">
      <div class="flex flex-1 min-w-0 items-center gap-2">
        <BotonVolver />
        <RouterLink :to="{ name: 'inicio' }" class="text-xl font-bold truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {{ perfil?.nombre || 'Mi portafolio' }}
        </RouterLink>
      </div>

      <nav class="flex flex-wrap justify-end gap-1">
        <RouterLink :to="{ name: 'inicio' }" class="btn btn-ghost btn-sm" exact-active-class="btn-active">
          Perfil
        </RouterLink>
        <RouterLink :to="{ name: 'galeria' }" class="btn btn-ghost btn-sm" active-class="btn-active">
          Proyectos
        </RouterLink>

        <RouterLink v-if="auth.autenticado" :to="{ name: 'admin-proyectos' }" class="btn btn-primary btn-sm">
          Mis proyectos
        </RouterLink>
        <RouterLink v-else :to="{ name: 'bienvenida' }" class="btn btn-outline btn-sm">Iniciar sesión</RouterLink>
        <SelectorTema />
      </nav>
    </header>

    <main class="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
      <router-view />
    </main>

    <footer class="footer footer-center bg-base-200 border-t border-base-300 p-8 text-sm">
      <p class="opacity-60">© {{ new Date().getFullYear() }} · Hecho por Laura Melgar</p>
    </footer>
  </div>
</template>
