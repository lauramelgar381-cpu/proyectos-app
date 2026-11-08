<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api, mensajeDeError, urlPortada, type ProyectoDetalle } from '@/api/proyectos'
import { useProyectosStore } from '@/stores/proyectos'
import { anadirArchivos, camposDesde, camposVacios, type CamposProyecto } from '@/utils/formularios'
import CamposProyectoForm from '@/components/CamposProyecto.vue'

const route = useRoute()
const router = useRouter()
const proyectos = useProyectosStore()

const id = String(route.params.id)
const proyecto = ref<ProyectoDetalle | null>(null)
const campos = reactive<CamposProyecto>(camposVacios())
const cargando = ref(true)
const guardando = ref(false)
const mensaje = ref('')
const error = ref('')

const nuevosArchivos = ref<File[]>([])
const inputArchivos = ref<HTMLInputElement | null>(null)
const nuevaPortada = ref<File | null>(null)
const portadaPrevia = ref<string | null>(null)
const inputPortada = ref<HTMLInputElement | null>(null)

async function cargar() {
  cargando.value = true
  try {
    proyecto.value = await api.obtener(id)
    Object.assign(campos, camposDesde(proyecto.value))
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
}

async function guardarDatos() {
  mensaje.value = ''
  error.value = ''

  if (!campos.nombre.trim()) {
    error.value = 'El nombre del proyecto es obligatorio.'
    return
  }

  guardando.value = true
  try {
    await api.actualizar(id, { ...campos })
    await cargar()
    mensaje.value = 'Cambios guardados.'
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}

function elegirArchivos(evento: Event) {
  const input = evento.target as HTMLInputElement
  nuevosArchivos.value = Array.from(input.files ?? [])
}

// Sustituye TODOS los archivos del proyecto por la carpeta elegida
async function reemplazarArchivos() {
  mensaje.value = ''
  error.value = ''

  const formulario = new FormData()
  const incluidos = anadirArchivos(formulario, nuevosArchivos.value)
  if (incluidos === 0) {
    error.value = 'Selecciona una carpeta con archivos de texto.'
    return
  }

  guardando.value = true
  try {
    await api.reemplazarArchivos(id, formulario)
    nuevosArchivos.value = []
    if (inputArchivos.value) inputArchivos.value.value = ''
    await cargar()
    mensaje.value = `Archivos reemplazados (${incluidos}).`
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}

function elegirPortada(evento: Event) {
  const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null
  nuevaPortada.value = archivo
  if (portadaPrevia.value) URL.revokeObjectURL(portadaPrevia.value)
  portadaPrevia.value = archivo ? URL.createObjectURL(archivo) : null
}

async function subirPortada() {
  if (!nuevaPortada.value) return
  mensaje.value = ''
  error.value = ''
  guardando.value = true
  try {
    await api.subirPortada(id, nuevaPortada.value)
    nuevaPortada.value = null
    if (portadaPrevia.value) URL.revokeObjectURL(portadaPrevia.value)
    portadaPrevia.value = null
    if (inputPortada.value) inputPortada.value.value = ''
    await cargar()
    mensaje.value = 'Portada actualizada.'
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}

async function quitarPortada() {
  if (!confirm('¿Quitar la imagen de portada?')) return
  try {
    await api.eliminarPortada(id)
    await cargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function eliminar() {
  if (!proyecto.value) return
  if (!confirm(`¿Eliminar "${proyecto.value.nombre}" y todos sus archivos? Esta acción no se puede deshacer.`)) return

  const eliminado = await proyectos.eliminar(id)
  if (eliminado) {
    router.push({ name: 'admin-proyectos' })
  } else {
    error.value = proyectos.error
  }
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-3xl mx-auto space-y-6">
    <div v-if="cargando" class="flex justify-center my-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="!proyecto" class="alert alert-error">
      <span>{{ error || 'No se encontró el proyecto.' }}</span>
    </div>

    <template v-else>
      <header class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-2xl font-bold">Editar: {{ proyecto.nombre }}</h1>
        <RouterLink :to="{ name: 'proyecto', params: { id } }" class="btn btn-ghost btn-sm">Ver en el sitio</RouterLink>
      </header>

      <div v-if="mensaje" class="alert alert-success"><span>{{ mensaje }}</span></div>
      <div v-if="error" class="alert alert-error"><span>{{ error }}</span></div>

      <form class="card bg-base-100 border border-base-300" @submit.prevent="guardarDatos">
        <div class="card-body space-y-4">
          <h2 class="card-title">Datos del proyecto</h2>
          <CamposProyectoForm v-model="campos" />
          <button type="submit" class="btn btn-primary" :disabled="guardando">Guardar cambios</button>
        </div>
      </form>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body space-y-4">
          <h2 class="card-title">Imagen de portada</h2>
          <div class="flex flex-col sm:flex-row items-start gap-4">
            <img
              v-if="portadaPrevia"
              :src="portadaPrevia"
              alt="Vista previa de la portada"
              class="w-64 aspect-video rounded-box object-contain bg-base-200 border border-base-300"
            />
            <img
              v-else-if="proyecto.tienePortada"
              :src="urlPortada(proyecto)"
              :alt="proyecto.nombre"
              class="w-64 aspect-video rounded-box object-contain bg-base-200 border border-base-300"
            />
            <div v-else class="w-64 aspect-video rounded-box bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-sm opacity-60">
              Sin portada
            </div>

            <div class="flex-1 w-full space-y-3">
              <input
                ref="inputPortada"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="file-input file-input-bordered w-full"
                @change="elegirPortada"
              />
              <p class="text-xs opacity-60">JPG, PNG o WEBP. Máximo 3 MB.</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn btn-primary btn-sm" :disabled="!nuevaPortada || guardando" @click="subirPortada">
                  Subir portada
                </button>
                <button v-if="proyecto.tienePortada" type="button" class="btn btn-error btn-outline btn-sm" @click="quitarPortada">
                  Quitar portada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body space-y-4">
          <h2 class="card-title">Archivos</h2>
          <p class="text-sm opacity-70">
            Actualmente tiene {{ proyecto.totalArchivos }} archivos. Al reemplazarlos, los actuales se eliminan.
          </p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              ref="inputArchivos"
              type="file"
              class="file-input file-input-bordered w-full"
              webkitdirectory
              multiple
              @change="elegirArchivos"
            />
            <button type="button" class="btn btn-warning" :disabled="guardando || nuevosArchivos.length === 0" @click="reemplazarArchivos">
              Reemplazar archivos
            </button>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-error/40">
        <div class="card-body flex-row items-center justify-between gap-4">
          <div>
            <h2 class="card-title text-error">Eliminar proyecto</h2>
            <p class="text-sm opacity-70">Se borran el proyecto y todos sus archivos.</p>
          </div>
          <button type="button" class="btn btn-error btn-outline" @click="eliminar">Eliminar</button>
        </div>
      </div>
    </template>
  </section>
</template>
