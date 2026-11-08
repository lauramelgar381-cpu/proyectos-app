<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api, mensajeDeError, type Estadisticas, type Proyecto } from '@/api/proyectos'
import { perfilApi, urlCv, urlFoto, type Perfil } from '@/api/perfil'
import ProyectoCard from '@/components/ProyectoCard.vue'

const perfil = ref<Perfil | null>(null)
const destacados = ref<Proyecto[]>([])
const todos = ref<Proyecto[]>([])
const estadisticas = ref<Estadisticas | null>(null)
const cargando = ref(true)
const error = ref('')

const maxTecnologia = computed(() =>
  Math.max(1, ...(estadisticas.value?.topTecnologias.map((t) => t.total) ?? [1])),
)

// Fecha que se muestra en la trayectoria: la del proyecto o, si no existe, la de creación
function fechaDe(proyecto: Proyecto): Date {
  return new Date(proyecto.fechaProyecto ?? proyecto.createdAt)
}

// Más recientes primero
const trayectoria = computed(() =>
  [...todos.value].sort((a, b) => fechaDe(b).getTime() - fechaDe(a).getTime()),
)

onMounted(async () => {
  try {
    const [datosPerfil, datosDestacados, datosEstadisticas, datosTodos] = await Promise.all([
      perfilApi.obtener(),
      api.listar({ destacados: true }),
      api.estadisticas(),
      api.listar(),
    ])
    perfil.value = datosPerfil
    destacados.value = datosDestacados
    estadisticas.value = datosEstadisticas
    todos.value = datosTodos
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-10">
    <div v-if="cargando" class="flex justify-center my-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <template v-else-if="perfil">
      <section class="hero rounded-box bg-base-200 py-10">
        <div class="hero-content flex-col md:flex-row gap-8 max-w-4xl">
          <div class="avatar shrink-0">
            <div class="w-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 bg-base-100">
              <img v-if="perfil.tieneFoto" :src="urlFoto(perfil)" :alt="perfil.nombre" />
              <span v-else class="flex items-center justify-center h-full text-5xl font-bold opacity-40">
                {{ perfil.nombre.charAt(0).toUpperCase() || '?' }}
              </span>
            </div>
          </div>

          <div class="text-center md:text-left space-y-3">
            <h1 class="text-4xl font-bold">{{ perfil.nombre || 'Mi portafolio' }}</h1>
            <p v-if="perfil.titulo" class="text-lg text-primary font-semibold">{{ perfil.titulo }}</p>
            <p v-if="perfil.bio" class="opacity-80 whitespace-pre-line">{{ perfil.bio }}</p>

            <div v-if="perfil.habilidades.length" class="flex flex-wrap justify-center md:justify-start gap-2">
              <span v-for="habilidad in perfil.habilidades" :key="habilidad" class="badge badge-outline">
                {{ habilidad }}
              </span>
            </div>

            <div class="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <RouterLink :to="{ name: 'galeria' }" class="btn btn-primary btn-sm">Ver proyectos</RouterLink>
              <a
                v-if="perfil.tieneCv"
                :href="urlCv"
                :download="perfil.cvNombre"
                class="btn btn-outline btn-sm"
              >
                Descargar CV
              </a>
              <a v-if="perfil.enlaces.github" :href="perfil.enlaces.github" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">GitHub</a>
              <a v-if="perfil.enlaces.linkedin" :href="perfil.enlaces.linkedin" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">LinkedIn</a>
              <a v-if="perfil.enlaces.email" :href="`mailto:${perfil.enlaces.email}`" class="btn btn-ghost btn-sm">Contacto</a>
            </div>
          </div>
        </div>
      </section>

      <section v-if="estadisticas" class="space-y-4">
        <div class="stats stats-vertical sm:stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-title">Proyectos</div>
            <div class="stat-value text-primary">{{ estadisticas.proyectos }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Archivos</div>
            <div class="stat-value">{{ estadisticas.archivos }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Tecnologías</div>
            <div class="stat-value">{{ estadisticas.tecnologias }}</div>
          </div>
        </div>

        <div v-if="estadisticas.topTecnologias.length" class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-lg">Tecnologías más usadas</h2>
            <div v-for="tecnologia in estadisticas.topTecnologias" :key="tecnologia.nombre" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span>{{ tecnologia.nombre }}</span>
                <span class="opacity-60">{{ tecnologia.total }}</span>
              </div>
              <progress class="progress progress-primary w-full" :value="tecnologia.total" :max="maxTecnologia"></progress>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Proyectos destacados</h2>
          <RouterLink :to="{ name: 'galeria' }" class="link link-primary text-sm">Ver todos</RouterLink>
        </div>

        <div v-if="destacados.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProyectoCard v-for="proyecto in destacados" :key="proyecto._id" :proyecto="proyecto" />
        </div>
        <p v-else class="opacity-60">
          Todavía no hay proyectos destacados. Marca alguno como "Mostrar en la portada" desde el panel.
        </p>
      </section>

      <section class="space-y-6">
        <h2 class="text-2xl font-bold">Trayectoria</h2>

        <p v-if="trayectoria.length === 0" class="opacity-60">
          Aún no hay proyectos. Cuando subas algunos, aparecerán aquí ordenados por fecha.
        </p>

        <ol v-else class="relative border-l-2 border-base-300 ml-3 space-y-8">
          <li v-for="proyecto in trayectoria" :key="proyecto._id" class="ml-6 relative">
            <span class="absolute -left-[2.2rem] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-base-100"></span>

            <div class="flex flex-wrap items-center gap-2 text-sm opacity-70">
              <time>{{ fechaDe(proyecto).getFullYear() }}</time>
              <span class="badge badge-sm" :class="proyecto.estado === 'terminado' ? 'badge-success' : 'badge-warning'">
                {{ proyecto.estado }}
              </span>
            </div>

            <RouterLink :to="{ name: 'proyecto', params: { id: proyecto._id } }" class="text-xl font-semibold link link-hover">
              {{ proyecto.nombre }}
            </RouterLink>
            <p v-if="proyecto.descripcion" class="opacity-70 max-w-2xl line-clamp-2">{{ proyecto.descripcion }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span v-for="tecnologia in proyecto.tecnologias" :key="tecnologia" class="badge badge-ghost badge-sm">
                {{ tecnologia }}
              </span>
            </div>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>
