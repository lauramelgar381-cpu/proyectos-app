<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api, mensajeDeError } from '@/api/proyectos'
import { useProyectosStore } from '@/stores/proyectos'
import { anadirArchivos, anadirCampos, camposVacios, type CamposProyecto } from '@/utils/formularios'
import CamposProyectoForm from './CamposProyecto.vue'

const proyectos = useProyectosStore()

const campos = reactive<CamposProyecto>(camposVacios())
const archivos = ref<File[]>([])
const inputArchivos = ref<HTMLInputElement | null>(null)
const portada = ref<File | null>(null)
const portadaPrevia = ref<string | null>(null)
const inputPortada = ref<HTMLInputElement | null>(null)

const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

function manejarArchivos(evento: Event) {
  const input = evento.target as HTMLInputElement
  archivos.value = Array.from(input.files ?? [])
}

function elegirPortada(evento: Event) {
  const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null
  portada.value = archivo
  if (portadaPrevia.value) URL.revokeObjectURL(portadaPrevia.value)
  portadaPrevia.value = archivo ? URL.createObjectURL(archivo) : null
}

function limpiar() {
  Object.assign(campos, camposVacios())
  archivos.value = []
  if (inputArchivos.value) inputArchivos.value.value = ''
  portada.value = null
  if (portadaPrevia.value) URL.revokeObjectURL(portadaPrevia.value)
  portadaPrevia.value = null
  if (inputPortada.value) inputPortada.value.value = ''
}

async function handleSubmit() {
  mensajeExito.value = ''
  mensajeError.value = ''

  if (!campos.nombre.trim()) {
    mensajeError.value = 'El nombre del proyecto es obligatorio.'
    return
  }

  const formulario = new FormData()
  anadirCampos(formulario, campos)
  const incluidos = anadirArchivos(formulario, archivos.value)
  // Sin carpeta, el enlace de GitHub es obligatorio
  if (incluidos === 0 && !campos.githubUrl.trim()) {
    mensajeError.value = 'Selecciona una carpeta con archivos de texto o indica el enlace de GitHub.'
    return
  }

  cargando.value = true
  try {
    const proyecto = await api.crear(formulario)
    // La portada se sube aparte, una vez creado el proyecto
    if (portada.value) await api.subirPortada(proyecto._id, portada.value)
    await proyectos.cargar()
    mensajeExito.value = `"${proyecto.nombre}" se guardó con ${proyecto.totalArchivos} archivos.`
    limpiar()
  } catch (e) {
    mensajeError.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto">
    <div class="card bg-base-100 shadow-xl border border-base-300">
      <div class="card-body">
        <h1 class="card-title text-2xl">Subir nuevo proyecto</h1>

        <div v-if="mensajeExito" class="alert alert-success">
          <span>{{ mensajeExito }}</span>
        </div>
        <div v-if="mensajeError" class="alert alert-error">
          <span>{{ mensajeError }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <CamposProyectoForm v-model="campos" />

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Imagen de portada (opcional)</span>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                v-if="portadaPrevia"
                :src="portadaPrevia"
                alt="Vista previa de la portada"
                class="w-64 aspect-video rounded-box object-contain bg-base-200 border border-base-300"
              />
              <input
                ref="inputPortada"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="file-input file-input-bordered w-full"
                @change="elegirPortada"
              />
            </div>
            <span class="label-text-alt mt-1 opacity-70">JPG, PNG o WEBP. Máximo 3 MB.</span>
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Carpeta del proyecto (opcional si indicas el enlace de GitHub)</span>
            <input
              ref="inputArchivos"
              type="file"
              class="file-input file-input-bordered file-input-primary w-full"
              webkitdirectory
              multiple
              @change="manejarArchivos"
            />
            <span v-if="archivos.length" class="label-text-alt mt-1 opacity-70">
              {{ archivos.length }} archivos seleccionados (se filtran al guardar)
            </span>
          </label>

          <button type="submit" class="btn btn-primary w-full" :disabled="cargando">
            <span v-if="cargando" class="loading loading-spinner"></span>
            {{ cargando ? 'Guardando en la base de datos...' : 'Guardar proyecto' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
