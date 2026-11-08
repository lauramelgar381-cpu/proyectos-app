<script setup lang="ts">
import SideMenu from './components/SideMenu.vue'
import BotonVolver from './components/BotonVolver.vue'
import SelectorTema from './components/SelectorTema.vue'
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-base-200 text-base-content">
    <SideMenu />
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="navbar bg-base-100 shadow-sm px-4">
        <BotonVolver />
        <div class="ml-auto">
          <SelectorTema />
        </div>
      </header>
      <main class="flex-1 min-w-0 p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
