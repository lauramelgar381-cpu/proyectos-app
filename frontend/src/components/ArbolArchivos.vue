<script setup lang="ts">
import type { NodoArbol } from '@/utils/codigo'

defineProps<{
  nodos: NodoArbol[]
  seleccionado: string | null
}>()

const emit = defineEmits<{
  seleccionar: [archivoId: string]
}>()
</script>

<template>
  <ul class="space-y-0.5 text-sm">
    <li v-for="nodo in nodos" :key="nodo.ruta">
      <details v-if="nodo.carpeta" open>
        <summary class="cursor-pointer font-semibold py-1">{{ nodo.nombre }}</summary>
        <div class="pl-3">
          <ArbolArchivos
            :nodos="nodo.hijos"
            :seleccionado="seleccionado"
            @seleccionar="emit('seleccionar', $event)"
          />
        </div>
      </details>

      <button
        v-else
        type="button"
        class="btn btn-ghost btn-xs w-full justify-start font-mono font-normal normal-case"
        :class="{ 'btn-active': seleccionado === nodo.archivoId }"
        @click="emit('seleccionar', nodo.archivoId!)"
      >
        {{ nodo.nombre }}
      </button>
    </li>
  </ul>
</template>
