<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import 'highlight.js/styles/github.css'
import { api, mensajeDeError, urlPortada, type ProyectoDetalle } from '@/api/proyectos'
import { useAuthStore } from '@/stores/auth'
import { formatoFecha, formatoTamano } from '@/utils/archivos'
import { construirArbol, resaltarCodigo } from '@/utils/codigo'
import { renderizarMarkdown } from '@/utils/markdown'
import ArbolArchivos from '@/components/ArbolArchivos.vue'
import TecnologiaBadge from '@/components/TecnologiaBadge.vue'

type Pestana = 'readme' | 'codigo' | 'info'

const route = useRoute()
const auth = useAuthStore()

const id = computed(() => String(route.params.id))
const proyecto = ref<ProyectoDetalle | null>(null)
const cargando = ref(true)
const error = ref('')

const pestana = ref<Pestana>('readme')
// null = cargando, '' = el proyecto no tiene README
const readmeHtml = ref<string | null>(null)

const arbol = computed(() => (proyecto.value ? construirArbol(proyecto.value.archivos) : []))
const archivoAbierto = ref<string | null>(null)
const rutaAbierta = ref('')
const codigoHtml = ref('')

async function cargar(idActual: string) {
  cargando.value = true
  error.value = ''
  readmeHtml.value = null
  archivoAbierto.value = null
  proyecto.value = null

  try {
    proyecto.value = await api.obtener(idActual)
  } catch (e) {
    error.value = mensajeDeError(e)
    cargando.value = false
    return
  }
  cargando.value = false

  api
    .readme(idActual)
    .then((readme) => (readmeHtml.value = renderizarMarkdown(readme.contenido)))
    .catch(() => (readmeHtml.value = ''))
}

async function abrirArchivo(archivoId: string) {
  if (!proyecto.value) return
  try {
    const archivo = await api.archivo(proyecto.value._id, archivoId)
    archivoAbierto.value = archivoId
    rutaAbierta.value = archivo.ruta
    codigoHtml.value = resaltarCodigo(archivo.contenido, archivo.ruta)
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

// Al entrar en la pestaña de código se abre el README, o el primer archivo si no hay
watch(pestana, (nueva) => {
  if (nueva !== 'codigo' || archivoAbierto.value || !proyecto.value) return
  const inicial =
    proyecto.value.archivos.find((archivo) => /^readme\.md$/i.test(archivo.ruta)) ??
    proyecto.value.archivos[0]
  if (inicial) abrirArchivo(inicial._id)
})

watch(id, (nuevo) => cargar(nuevo), { immediate: true })
</script>

<template>
  <section class="space-y-6">
    <div v-if="cargando" class="flex justify-center my-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="error && !proyecto" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <template v-else-if="proyecto">

      <img
        v-if="proyecto.tienePortada"
        :src="urlPortada(proyecto)"
        :alt="proyecto.nombre"
        class="w-full aspect-video object-contain rounded-box border border-base-300 bg-base-200"
      />

      <header class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-3xl font-bold">{{ proyecto.nombre }}</h1>
            <span class="badge" :class="proyecto.estado === 'terminado' ? 'badge-success' : 'badge-warning'">
              {{ proyecto.estado }}
            </span>
          </div>
          <p v-if="proyecto.descripcion" class="opacity-70 max-w-3xl">{{ proyecto.descripcion }}</p>
          <div class="flex flex-wrap gap-2">
            <TecnologiaBadge v-for="tecnologia in proyecto.tecnologias" :key="tecnologia" :nombre="tecnologia" />
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <a v-if="proyecto.githubUrl" :href="proyecto.githubUrl" target="_blank" rel="noopener" class="btn btn-outline btn-sm">GitHub</a>
          <a v-if="proyecto.demoUrl" :href="proyecto.demoUrl" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Demo en vivo</a>
          <RouterLink
            v-if="auth.autenticado"
            :to="{ name: 'editar', params: { id: proyecto._id } }"
            class="btn btn-ghost btn-sm"
          >
            Editar
          </RouterLink>
        </div>
      </header>

      <div role="tablist" class="tabs tabs-bordered">
        <button role="tab" class="tab" :class="{ 'tab-active': pestana === 'readme' }" @click="pestana = 'readme'">README</button>
        <button role="tab" class="tab" :class="{ 'tab-active': pestana === 'codigo' }" @click="pestana = 'codigo'">Código</button>
        <button role="tab" class="tab" :class="{ 'tab-active': pestana === 'info' }" @click="pestana = 'info'">Información</button>
      </div>

      <div v-if="error" class="alert alert-error">
        <span>{{ error }}</span>
      </div>

      <div v-if="pestana === 'readme'">
        <div v-if="readmeHtml === null" class="flex justify-center my-10">
          <span class="loading loading-spinner"></span>
        </div>
        <p v-else-if="readmeHtml === ''" class="opacity-60">Este proyecto no tiene README.</p>
        <article v-else class="prose max-w-none" v-html="readmeHtml"></article>
      </div>

      <div v-else-if="pestana === 'codigo'" class="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4">
        <div class="bg-base-200 rounded-box p-2 max-h-[70vh] overflow-auto">
          <ArbolArchivos :nodos="arbol" :seleccionado="archivoAbierto" @seleccionar="abrirArchivo" />
        </div>

        <div class="min-w-0">
          <template v-if="archivoAbierto">
            <p class="font-mono text-sm mb-2 break-all">{{ rutaAbierta }}</p>
            <pre class="bg-base-200 rounded-box p-4 overflow-auto max-h-[70vh] text-sm"><code class="hljs" v-html="codigoHtml"></code></pre>
          </template>
          <p v-else class="opacity-60">Selecciona un archivo para verlo.</p>
        </div>
      </div>

      <dl v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body py-4">
            <dt class="text-sm opacity-60">Archivos</dt>
            <dd class="text-lg font-semibold">{{ proyecto.totalArchivos }} · {{ formatoTamano(proyecto.tamanoTotal) }}</dd>
          </div>
        </div>
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body py-4">
            <dt class="text-sm opacity-60">Fecha del proyecto</dt>
            <dd class="text-lg font-semibold">
              {{ formatoFecha(proyecto.fechaProyecto ?? proyecto.createdAt) }}
            </dd>
          </div>
        </div>
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body py-4">
            <dt class="text-sm opacity-60">Tecnologías</dt>
            <dd class="text-lg font-semibold">{{ proyecto.tecnologias.join(', ') || 'Sin especificar' }}</dd>
          </div>
        </div>
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body py-4">
            <dt class="text-sm opacity-60">Última actualización</dt>
            <dd class="text-lg font-semibold">{{ formatoFecha(proyecto.updatedAt) }}</dd>
          </div>
        </div>
      </dl>
    </template>
  </section>
</template>
