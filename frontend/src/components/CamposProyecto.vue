<script setup lang="ts">
import type { CamposProyecto } from '@/utils/formularios'

// Campos compartidos por "Subir proyecto" y "Editar proyecto"
const campos = defineModel<CamposProyecto>({ required: true })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <label class="form-control md:col-span-2">
      <span class="label-text font-semibold mb-1">Nombre del proyecto</span>
      <input v-model="campos.nombre" type="text" placeholder="Ej. Security Lab" class="input input-bordered w-full" maxlength="120" required />
    </label>

    <label class="form-control md:col-span-2">
      <span class="label-text font-semibold mb-1">Descripción</span>
      <textarea v-model="campos.descripcion" class="textarea textarea-bordered w-full" rows="3" maxlength="2000"></textarea>
    </label>

    <label class="form-control md:col-span-2">
      <span class="label-text font-semibold mb-1">Tecnologías (separadas por coma)</span>
      <input v-model="campos.tecnologias" type="text" placeholder="Ej. Vue, Tailwind, Node, MongoDB" class="input input-bordered w-full" />
    </label>

    <label class="form-control">
      <span class="label-text font-semibold mb-1">Enlace de GitHub</span>
      <input v-model="campos.githubUrl" type="url" placeholder="https://github.com/usuario/repo" class="input input-bordered w-full" />
    </label>

    <label class="form-control">
      <span class="label-text font-semibold mb-1">Enlace de la demo</span>
      <input v-model="campos.demoUrl" type="url" placeholder="https://tu-proyecto.vercel.app" class="input input-bordered w-full" />
    </label>

        <label class="form-control">
      <span class="label-text font-semibold mb-1">Estado</span>
      <select v-model="campos.estado" class="select select-bordered w-full">
        <option value="terminado">Terminado</option>
        <option value="en progreso">En progreso</option>
      </select>
    </label>

    <label class="form-control">
      <span class="label-text font-semibold mb-1">Fecha del proyecto</span>
      <input v-model="campos.fechaProyecto" type="date" class="input input-bordered w-full" />
    </label>

    <label class="label cursor-pointer justify-start gap-3 md:col-span-2">
      <input v-model="campos.destacado" type="checkbox" class="checkbox checkbox-primary" />
      <span class="label-text">Mostrar en la portada</span>
    </label>
  </div>
</template>
