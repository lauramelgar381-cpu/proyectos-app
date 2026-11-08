<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { perfilApi, urlFoto, urlCv, type Perfil } from '@/api/perfil'
import { mensajeDeError } from '@/api/cliente'

const perfil = reactive<Perfil>({
  nombre: '',
  titulo: '',
  bio: '',
  habilidades: [],
  enlaces: { github: '', linkedin: '', email: '' },
  tieneFoto: false,
  tieneCv: false,
  cvNombre: '',
})
// Las habilidades se escriben separadas por coma y se envían como lista
const habilidadesTexto = ref('')
const cargando = ref(true)
const guardando = ref(false)
const mensaje = ref('')
const error = ref('')

const fotoElegida = ref<File | null>(null)
const fotoPrevia = ref<string | null>(null)
const cvElegido = ref<File | null>(null)
const inputFoto = ref<HTMLInputElement | null>(null)
const inputCv = ref<HTMLInputElement | null>(null)

async function recargar() {
  const datos = await perfilApi.obtener()
  Object.assign(perfil, datos)
  habilidadesTexto.value = datos.habilidades.join(', ')
}

onMounted(async () => {
  try {
    await recargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  mensaje.value = ''
  error.value = ''
  guardando.value = true

  try {
    const habilidades = habilidadesTexto.value
      .split(',')
      .map((habilidad) => habilidad.trim())
      .filter(Boolean)

    await perfilApi.guardar({ ...perfil, habilidades })
    await recargar()
    mensaje.value = 'Perfil guardado.'
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}

function elegirFoto(evento: Event) {
  const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null
  fotoElegida.value = archivo
  if (fotoPrevia.value) URL.revokeObjectURL(fotoPrevia.value)
  fotoPrevia.value = archivo ? URL.createObjectURL(archivo) : null
}

async function subirFoto() {
  if (!fotoElegida.value) return
  mensaje.value = ''
  error.value = ''
  guardando.value = true
  try {
    await perfilApi.subirFoto(fotoElegida.value)
    fotoElegida.value = null
    if (fotoPrevia.value) URL.revokeObjectURL(fotoPrevia.value)
    fotoPrevia.value = null
    if (inputFoto.value) inputFoto.value.value = ''
    await recargar()
    mensaje.value = 'Foto actualizada.'
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}

async function quitarFoto() {
  if (!confirm('¿Quitar la foto de perfil?')) return
  try {
    await perfilApi.eliminarFoto()
    await recargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

function elegirCv(evento: Event) {
  cvElegido.value = (evento.target as HTMLInputElement).files?.[0] ?? null
}

async function subirCv() {
  if (!cvElegido.value) return
  mensaje.value = ''
  error.value = ''
  guardando.value = true
  try {
    await perfilApi.subirCv(cvElegido.value)
    cvElegido.value = null
    if (inputCv.value) inputCv.value.value = ''
    await recargar()
    mensaje.value = 'CV actualizado.'
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}

async function quitarCv() {
  if (!confirm('¿Quitar el CV?')) return
  try {
    await perfilApi.eliminarCv()
    await recargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}
</script>

<template>
  <section class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Editar perfil</h1>

    <div v-if="cargando" class="flex justify-center my-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <div v-if="mensaje" class="alert alert-success"><span>{{ mensaje }}</span></div>
      <div v-if="error" class="alert alert-error"><span>{{ error }}</span></div>

      <!-- Foto de perfil -->
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body space-y-4">
          <h2 class="card-title">Foto de perfil</h2>
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <div class="avatar">
              <div class="w-32 rounded-full bg-base-200">
                <img v-if="fotoPrevia" :src="fotoPrevia" alt="Vista previa" />
                <img v-else-if="perfil.tieneFoto" :src="urlFoto(perfil)" :alt="perfil.nombre" />
                <span v-else class="flex items-center justify-center h-full text-4xl font-bold opacity-40">
                  {{ perfil.nombre.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <div class="flex-1 w-full space-y-3">
              <input
                ref="inputFoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="file-input file-input-bordered w-full"
                @change="elegirFoto"
              />
              <p class="text-xs opacity-60">JPG, PNG o WEBP. Máximo 2 MB.</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn btn-primary btn-sm" :disabled="!fotoElegida || guardando" @click="subirFoto">
                  Subir foto
                </button>
                <button v-if="perfil.tieneFoto" type="button" class="btn btn-error btn-outline btn-sm" @click="quitarFoto">
                  Quitar foto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CV -->
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body space-y-4">
          <h2 class="card-title">Currículum (PDF)</h2>
          <p v-if="perfil.tieneCv" class="text-sm opacity-70">Archivo actual: {{ perfil.cvNombre }}</p>
          <input
            ref="inputCv"
            type="file"
            accept="application/pdf"
            class="file-input file-input-bordered w-full"
            @change="elegirCv"
          />
          <p class="text-xs opacity-60">Máximo 5 MB.</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn btn-primary btn-sm" :disabled="!cvElegido || guardando" @click="subirCv">
              Subir CV
            </button>
            <a v-if="perfil.tieneCv" :href="urlCv" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Ver CV</a>
            <button v-if="perfil.tieneCv" type="button" class="btn btn-error btn-outline btn-sm" @click="quitarCv">
              Quitar CV
            </button>
          </div>
        </div>
      </div>

      <!-- Datos del perfil -->
      <form class="card bg-base-100 border border-base-300" @submit.prevent="guardar">
        <div class="card-body space-y-4">
          <h2 class="card-title">Datos</h2>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Nombre</span>
            <input v-model="perfil.nombre" type="text" class="input input-bordered w-full" maxlength="120" />
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Título o especialidad</span>
            <input v-model="perfil.titulo" type="text" placeholder="Ej. Desarrolladora Full Stack" class="input input-bordered w-full" maxlength="120" />
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Biografía</span>
            <textarea v-model="perfil.bio" class="textarea textarea-bordered w-full" rows="5" maxlength="2000"></textarea>
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Habilidades (separadas por coma)</span>
            <input v-model="habilidadesTexto" type="text" placeholder="Vue, Node, MongoDB" class="input input-bordered w-full" />
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">GitHub</span>
            <input v-model="perfil.enlaces.github" type="url" class="input input-bordered w-full" />
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">LinkedIn</span>
            <input v-model="perfil.enlaces.linkedin" type="url" class="input input-bordered w-full" />
          </label>

          <label class="form-control">
            <span class="label-text font-semibold mb-1">Correo de contacto</span>
            <input v-model="perfil.enlaces.email" type="email" class="input input-bordered w-full" />
          </label>

          <button type="submit" class="btn btn-primary" :disabled="guardando">Guardar datos</button>
        </div>
      </form>
    </template>
  </section>
</template>
