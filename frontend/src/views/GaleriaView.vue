<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { api, mensajeDeError, type Proyecto, type TecnologiaContada } from '@/api/proyectos'
import ProyectoCard from '@/components/ProyectoCard.vue'

type Orden = 'reciente' | 'antiguo' | 'nombre'

const q = ref('')
const tecnologia = ref('')
const orden = ref<Orden>('reciente')

const proyectos = ref<Proyecto[]>([])
const tecnologias = ref<TecnologiaContada[]>([])
const cargando = ref(false)
const error = ref('')

let temporizador: number | undefined
// Evita que una respuesta antigua pise a una más reciente
let solicitud = 0

async function buscar() {
  const actual = ++solicitud
  cargando.value = true
  error.value = ''

  try {
    const resultado = await api.listar({
      q: q.value.trim(),
      tecnologia: tecnologia.value,
      orden: orden.value,
    })
    if (actual === solicitud) proyectos.value = resultado
  } catch (e) {
    if (actual === solicitud) error.value = mensajeDeError(e)
  } finally {
    if (actual === solicitud) cargando.value = false
  }
}

function alternarTecnologia(nombre: string) {
  tecnologia.value = tecnologia.value === nombre ? '' : nombre
}

function limpiarFiltros() {
  q.value = ''
  tecnologia.value = ''
  orden.value = 'reciente'
}

// La búsqueda espera 300 ms tras la última tecla para no pedir en cada letra
watch(q, () => {
  clearTimeout(temporizador)
  temporizador = window.setTimeout(buscar, 300)
})
watch([tecnologia, orden], buscar)

onMounted(() => {
  buscar()
  api.tecnologias().then((lista) => (tecnologias.value = lista)).catch(() => {
    // Sin chips de tecnología, la galería sigue funcionando con búsqueda y orden
  })
})

onBeforeUnmount(() => clearTimeout(temporizador))
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-3xl font-bold">Proyectos</h1>
      <p class="opacity-70">Busca por nombre, descripción o tecnología.</p>
    </header>

    <div class="card bg-base-100 border border-base-300">
      <div class="card-body gap-4 p-4 md:p-6">
        <div class="flex flex-col md:flex-row gap-3">
          <input
            v-model="q"
            type="search"
            placeholder="Buscar proyectos..."
            class="input input-bordered w-full"
          />
          <select v-model="orden" class="select select-bordered md:w-56">
            <option value="reciente">Más recientes</option>
            <option value="antiguo">Más antiguos</option>
            <option value="nombre">Por nombre</option>
          </select>
        </div>

        <div v-if="tecnologias.length" class="flex flex-wrap gap-2">
          <button
            v-for="tech in tecnologias"
            :key="tech.nombre"
            type="button"
            class="btn btn-xs"
            :class="tecnologia === tech.nombre ? 'btn-primary' : 'btn-outline'"
            @click="alternarTecnologia(tech.nombre)"
          >
            {{ tech.nombre }} ({{ tech.total }})
          </button>
        </div>

        <div class="flex justify-between items-center text-sm opacity-70">
          <span>{{ proyectos.length }} resultados</span>
          <button
            v-if="q || tecnologia || orden !== 'reciente'"
            type="button"
            class="link link-hover"
            @click="limpiarFiltros"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-if="cargando" class="flex justify-center my-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="proyectos.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProyectoCard v-for="proyecto in proyectos" :key="proyecto._id" :proyecto="proyecto" />
    </div>

    <p v-else-if="!error" class="text-center opacity-60 py-10">
      No encontramos proyectos con esos filtros.
    </p>
  </section>
</template>
