<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { api, mensajeDeError, type EstadoProyecto, type Proyecto } from '@/api/proyectos'
import { useProyectosStore } from '@/stores/proyectos'
import { formatoFecha, formatoTamano } from '@/utils/archivos'
import TecnologiaBadge from '@/components/TecnologiaBadge.vue'

const POR_PAGINA = 5
const TECNOLOGIAS_VISIBLES = 3

const proyectos = useProyectosStore()
const pagina = ref(1)

const totalPaginas = computed(() => Math.max(1, Math.ceil(proyectos.lista.length / POR_PAGINA)))
const paginas = computed(() => Array.from({ length: totalPaginas.value }, (_, i) => i + 1))
const visibles = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA
  return proyectos.lista.slice(inicio, inicio + POR_PAGINA)
})
const rangoTexto = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA + 1
  const fin = Math.min(pagina.value * POR_PAGINA, proyectos.lista.length)
  return `${inicio}–${fin} de ${proyectos.lista.length}`
})

// Si al eliminar quedan menos páginas, se vuelve a la última que exista
watch(totalPaginas, (total) => {
  if (pagina.value > total) pagina.value = total
})

function irA(numero: number) {
  pagina.value = Math.min(Math.max(1, numero), totalPaginas.value)
}

onMounted(() => proyectos.cargar())

async function eliminar(id: string, nombre: string) {
  if (!confirm(`¿Eliminar "${nombre}" y todos sus archivos?`)) return
  await proyectos.eliminar(id)
}

// Cambia el estado (en progreso / terminado) y refresca la lista
async function cambiarEstado(proyecto: Proyecto, estado: EstadoProyecto) {
  if (proyecto.estado === estado) return
  try {
    await api.actualizar(proyecto._id, { estado })
    await proyectos.cargar()
  } catch (e) {
    proyectos.error = mensajeDeError(e)
  }
}
</script>

<template>
  <section class="w-full min-w-0 space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Mis proyectos</h1>
        <p class="text-sm opacity-60">Administra tus proyectos, sus tareas y su estado.</p>
      </div>
      <RouterLink :to="{ name: 'subir' }" class="btn btn-primary btn-sm">Subir proyecto</RouterLink>
    </div>

    <div v-if="proyectos.error" class="alert alert-error">
      <span>{{ proyectos.error }}</span>
    </div>

    <div v-if="proyectos.cargando" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="card bg-base-100 border border-base-300">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th class="w-12">#</th>
              <th>Proyecto</th>
              <th>Tecnologías</th>
              <th>Archivos</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="proyectos.lista.length === 0">
              <td colspan="7" class="text-center opacity-60 py-10">
                No hay proyectos todavía. ¡Sube el primero!
              </td>
            </tr>

            <tr v-for="(proj, indice) in visibles" :key="proj._id">
              <td class="font-mono text-sm opacity-60">{{ (pagina - 1) * POR_PAGINA + indice + 1 }}</td>
              <td class="max-w-xs">
                <div class="flex items-center gap-2">
                  <span class="font-semibold truncate">{{ proj.nombre }}</span>
                  <span v-if="proj.destacado" class="badge badge-secondary badge-sm shrink-0">portada</span>
                </div>
                <p class="text-sm opacity-60 truncate">{{ proj.descripcion || 'Sin descripción' }}</p>
              </td>

              <td>
                <div class="flex flex-wrap gap-1 max-w-[14rem]">
                  <TecnologiaBadge
                    v-for="tech in proj.tecnologias.slice(0, TECNOLOGIAS_VISIBLES)"
                    :key="tech"
                    :nombre="tech"
                  />
                  <span v-if="proj.tecnologias.length > TECNOLOGIAS_VISIBLES" class="badge badge-ghost badge-sm">
                    +{{ proj.tecnologias.length - TECNOLOGIAS_VISIBLES }}
                  </span>
                </div>
              </td>

              <td class="whitespace-nowrap">
                <span v-if="proj.totalArchivos > 0">
                  <span class="font-semibold">{{ proj.totalArchivos }}</span> archivos
                  <span class="block text-xs opacity-60">{{ formatoTamano(proj.tamanoTotal) }}</span>
                </span>
                <span v-else-if="proj.githubUrl" class="badge badge-ghost badge-sm">Solo GitHub</span>
                <span v-else class="opacity-60 text-sm">Sin archivos</span>
              </td>

              <td>
                <select
                  class="select select-bordered select-sm w-36"
                  :value="proj.estado"
                  @change="cambiarEstado(proj, ($event.target as HTMLSelectElement).value as EstadoProyecto)"
                >
                  <option value="en progreso">En progreso</option>
                  <option value="terminado">Terminado</option>
                </select>
              </td>

              <td class="whitespace-nowrap text-sm">{{ formatoFecha(proj.createdAt) }}</td>

              <td>
                <div class="flex justify-end">
                  <div class="join">
                    <RouterLink :to="{ name: 'proyecto', params: { id: proj._id } }" class="btn btn-ghost btn-xs join-item">Ver</RouterLink>
                    <RouterLink :to="{ name: 'admin-tareas', params: { id: proj._id } }" class="btn btn-ghost btn-xs join-item">Tareas</RouterLink>
                    <RouterLink :to="{ name: 'editar', params: { id: proj._id } }" class="btn btn-ghost btn-xs join-item">Editar</RouterLink>
                    <button class="btn btn-ghost btn-xs join-item text-error" @click="eliminar(proj._id, proj.nombre)">Eliminar</button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="proyectos.lista.length > 0" class="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-base-300">
        <span class="text-sm opacity-60">{{ rangoTexto }}</span>

        <div class="join">
          <button class="btn btn-sm join-item" :disabled="pagina === 1" @click="irA(pagina - 1)">«</button>
          <button
            v-for="numero in paginas"
            :key="numero"
            class="btn btn-sm join-item"
            :class="{ 'btn-active btn-primary': numero === pagina }"
            @click="irA(numero)"
          >
            {{ numero }}
          </button>
          <button class="btn btn-sm join-item" :disabled="pagina === totalPaginas" @click="irA(pagina + 1)">»</button>
        </div>
      </div>
    </div>
  </section>
</template>
