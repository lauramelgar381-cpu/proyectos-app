<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BotonVolver from '@/components/BotonVolver.vue'
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
  <div class="min-h-screen flex flex-col">
    <header class="navbar bg-base-100 shadow-sm px-4 flex-wrap gap-2">
      <div class="flex flex-1 min-w-0 items-center gap-2">
        <BotonVolver />
        <RouterLink :to="{ name: 'inicio' }" class="text-xl font-bold truncate">
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
      </nav>
    </header>

    <main class="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
      <router-view />
    </main>

    <footer class="footer footer-center bg-base-200 p-6 text-sm">
      <p>© {{ new Date().getFullYear() }} {{ perfil?.nombre }}</p>
    </footer>
  </div>
</template>
