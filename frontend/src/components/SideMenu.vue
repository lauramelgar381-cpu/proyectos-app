<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function cerrarSesion() {
  auth.cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="bg-base-200 md:w-64 md:min-h-screen p-4 space-y-4">
    <p class="font-bold text-lg px-2">Panel</p>

    <ul class="menu rounded-box">
      <li>
        <RouterLink :to="{ name: 'inicio' }">Ver sitio</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'admin-proyectos' }" active-class="active">Mis proyectos</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'subir' }" active-class="active">Subir proyecto</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'admin-perfil' }" active-class="active">Editar perfil</RouterLink>
      </li>
    </ul>

    <ul class="menu rounded-box">
      <li>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </li>
    </ul>
  </aside>
</template>
