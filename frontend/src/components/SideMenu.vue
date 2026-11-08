<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api, mensajeDeError, type TareaPendiente } from '@/api/proyectos'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const pendientes = ref<TareaPendiente[]>([])
const error = ref('')

async function cargarPendientes() {
  try {
    pendientes.value = await api.tareasPendientes()
    error.value = ''
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

// Se vuelve a consultar al cambiar de vista, así aparecen las tareas recién guardadas
watch(() => route.fullPath, cargarPendientes, { immediate: true })

async function completar(tarea: TareaPendiente) {
  try {
    await api.actualizarTarea(tarea.proyecto, tarea._id, { completada: true })
    pendientes.value = pendientes.value.filter((t) => t._id !== tarea._id)
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

function cerrarSesion() {
  auth.cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="sidebar-panel bg-base-100 border-r border-base-300 md:w-64 md:min-h-screen p-4 space-y-4">
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

    <section class="space-y-2">
      <div class="flex items-center justify-between px-2">
        <h2 class="font-semibold text-sm">Tareas pendientes</h2>
        <span v-if="pendientes.length" class="badge badge-primary badge-sm">{{ pendientes.length }}</span>
      </div>

      <p v-if="error" class="text-xs text-error px-2">{{ error }}</p>
      <p v-else-if="pendientes.length === 0" class="text-xs opacity-60 px-2">
        No hay tareas pendientes en proyectos en progreso.
      </p>

      <ul v-else class="space-y-2">
        <li v-for="tarea in pendientes" :key="tarea._id" class="flex items-start gap-2 rounded-box bg-base-100 p-2">
          <input type="checkbox" class="checkbox checkbox-xs mt-1 shrink-0" @change="completar(tarea)" />
          <div class="min-w-0">
            <p class="text-sm break-words">{{ tarea.titulo }}</p>
            <RouterLink
              :to="{ name: 'admin-tareas', params: { id: tarea.proyecto } }"
              class="block truncate text-xs opacity-60 link link-hover"
            >
              {{ tarea.proyectoNombre }}
            </RouterLink>
          </div>
        </li>
      </ul>
    </section>

    <ul class="menu rounded-box">
      <li>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </li>
    </ul>
  </aside>
</template>
