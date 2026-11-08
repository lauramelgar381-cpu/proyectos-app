<script setup lang="ts">
import { ref } from 'vue'
import { aplicarTema, TEMAS, temaActual } from '@/utils/tema'

const oscuro = ref(temaActual() === TEMAS.oscuro)

function alternar() {
  oscuro.value = !oscuro.value
  aplicarTema(oscuro.value ? TEMAS.oscuro : TEMAS.claro)
}
</script>

<template>
  <!-- swap: muestra el sol en modo oscuro (para volver al claro) y la luna en modo claro -->
  <label class="swap swap-rotate btn btn-ghost btn-circle btn-sm" :title="oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
    <input type="checkbox" :checked="oscuro" aria-label="Cambiar tema" @change="alternar" />
    <svg class="swap-on h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg class="swap-off h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </label>
</template>
