<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { urlPortada, type Proyecto } from '@/api/proyectos'
import TecnologiaBadge from '@/components/TecnologiaBadge.vue'

defineProps<{ proyecto: Proyecto }>()
</script>

<template>
  <article
    class="card group h-full overflow-hidden bg-base-100 border border-base-300 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
  >
    <figure class="aspect-video w-full overflow-hidden bg-base-200 bg-gradient-to-br from-primary/30 to-secondary/30">
      <img
        v-if="proyecto.tienePortada || proyecto.imagenPortada"
        :src="proyecto.tienePortada ? urlPortada(proyecto) : proyecto.imagenPortada"
        :alt="proyecto.nombre"
        class="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <span v-else class="text-5xl font-bold opacity-40">
        {{ proyecto.nombre.charAt(0).toUpperCase() }}
      </span>
    </figure>

    <div class="card-body">
      <div class="flex items-start justify-between gap-2">
        <h3 class="card-title text-lg transition-colors group-hover:text-primary">{{ proyecto.nombre }}</h3>
        <span
          class="badge badge-sm shrink-0"
          :class="proyecto.estado === 'terminado' ? 'badge-success' : 'badge-warning'"
        >
          {{ proyecto.estado }}
        </span>
      </div>

      <p class="text-sm opacity-70 line-clamp-3">{{ proyecto.descripcion || 'Sin descripción' }}</p>

      <div class="flex flex-wrap gap-1">
        <TecnologiaBadge v-for="tecnologia in proyecto.tecnologias.slice(0, 4)" :key="tecnologia" :nombre="tecnologia" />
        <span v-if="proyecto.tecnologias.length > 4" class="badge badge-ghost badge-sm">
          +{{ proyecto.tecnologias.length - 4 }}
        </span>
      </div>

      <div class="card-actions justify-end mt-auto pt-2">
        <RouterLink :to="{ name: 'proyecto', params: { id: proyecto._id } }" class="btn btn-primary btn-sm">
          Ver detalle
        </RouterLink>
      </div>
    </div>
  </article>
</template>
