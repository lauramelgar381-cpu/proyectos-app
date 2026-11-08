<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Vistas de entrada: desde ellas no tiene sentido volver
const RAICES = ['inicio', 'galeria', 'bienvenida', 'login', 'admin-proyectos']

const visible = computed(() => {
  // Depende de la ruta para recalcularse al navegar (el historial no es reactivo)
  route.fullPath
  if (RAICES.includes(String(route.name))) return false
  // vue-router guarda la ruta anterior en history.state.back. Sin ella, no hay a dónde volver
  return Boolean(window.history.state?.back)
})

function volver() {
  router.back()
}
</script>

<template>
  <button v-if="visible" type="button" class="btn btn-ghost btn-sm whitespace-nowrap" @click="volver">
    ← Volver
  </button>
</template>
