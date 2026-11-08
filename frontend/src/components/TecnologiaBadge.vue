<script setup lang="ts">
import { computed } from 'vue'
import { iconoDeTecnologia } from '@/utils/tecnologias'

const props = defineProps<{ nombre: string }>()

const icono = computed(() => iconoDeTecnologia(props.nombre))
</script>

<template>
  <!-- h-auto y max-w-full: la etiqueta crece con el texto y no se corta a media línea -->
  <span class="badge badge-outline h-auto max-w-full gap-1.5 py-1 px-2 font-normal" :title="nombre">
    <svg
      v-if="icono"
      viewBox="0 0 24 24"
      class="h-3.5 w-3.5 shrink-0"
      :style="{ color: `#${icono.hex}` }"
      fill="currentColor"
      aria-hidden="true"
    >
      <path :d="icono.path" />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      class="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
    <span class="truncate min-w-0">{{ nombre }}</span>
  </span>
</template>
