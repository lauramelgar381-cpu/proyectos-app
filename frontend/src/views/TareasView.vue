<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api, mensajeDeError, type EstadoProyecto, type Proyecto, type Tarea } from '@/api/proyectos'

const route = useRoute()
const id = String(route.params.id)

const proyecto = ref<Proyecto | null>(null)
const tareas = ref<Tarea[]>([])
const nuevaTarea = ref('')
const cargando = ref(true)
const error = ref('')

async function cargar() {
  error.value = ''
  try {
    const [datosProyecto, datosTareas] = await Promise.all([api.obtener(id), api.tareas(id)])
    proyecto.value = datosProyecto
    tareas.value = datosTareas
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
}

async function agregar() {
  const titulo = nuevaTarea.value.trim()
  if (!titulo) return
  try {
    const creada = await api.crearTarea(id, titulo)
    tareas.value.push(creada)
    nuevaTarea.value = ''
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function alternar(tarea: Tarea) {
  try {
    const actualizada = await api.actualizarTarea(id, tarea._id, { completada: !tarea.completada })
    Object.assign(tarea, actualizada)
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function eliminar(tarea: Tarea) {
  try {
    await api.eliminarTarea(id, tarea._id)
    tareas.value = tareas.value.filter((t) => t._id !== tarea._id)
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

// Cambia el estado del proyecto desde la misma pantalla
async function cambiarEstado(estado: EstadoProyecto) {
  if (!proyecto.value || proyecto.value.estado === estado) return
  try {
    proyecto.value = { ...proyecto.value, ...(await api.actualizar(id, { estado })) }
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-2xl mx-auto space-y-6">
    <div v-if="cargando" class="flex justify-center my-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="!proyecto" class="alert alert-error">
      <span>{{ error || 'No se encontró el proyecto.' }}</span>
    </div>

    <template v-else>
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm opacity-60">Tareas del proyecto</p>
          <h1 class="text-2xl font-bold">{{ proyecto.nombre }}</h1>
        </div>
        <RouterLink :to="{ name: 'admin-proyectos' }" class="btn btn-ghost btn-sm">Volver a mis proyectos</RouterLink>
      </header>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body flex-row flex-wrap items-center justify-between gap-3">
          <span class="font-semibold">Estado del proyecto</span>
          <div class="join">
            <button
              type="button"
              class="btn btn-sm join-item"
              :class="proyecto.estado === 'en progreso' ? 'btn-warning' : 'btn-outline'"
              @click="cambiarEstado('en progreso')"
            >
              En progreso
            </button>
            <button
              type="button"
              class="btn btn-sm join-item"
              :class="proyecto.estado === 'terminado' ? 'btn-success' : 'btn-outline'"
              @click="cambiarEstado('terminado')"
            >
              Terminado
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-error"><span>{{ error }}</span></div>

      <form class="flex gap-2" @submit.prevent="agregar">
        <input v-model="nuevaTarea" type="text" placeholder="Nueva tarea..." class="input input-bordered w-full" maxlength="200" />
        <button type="submit" class="btn btn-primary" :disabled="!nuevaTarea.trim()">Agregar</button>
      </form>

      <p v-if="tareas.length === 0" class="opacity-60">No hay tareas todavía.</p>

      <ul class="space-y-2">
        <li
          v-for="tarea in tareas"
          :key="tarea._id"
          class="flex items-center gap-3 p-3 rounded-box bg-base-100 border border-base-300"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-primary"
            :checked="tarea.completada"
            @change="alternar(tarea)"
          />
          <span class="flex-1 min-w-0 break-words" :class="{ 'line-through opacity-50': tarea.completada }">
            {{ tarea.titulo }}
          </span>
          <button type="button" class="btn btn-ghost btn-xs text-error" @click="eliminar(tarea)">Eliminar</button>
        </li>
      </ul>
    </template>
  </section>
</template>
