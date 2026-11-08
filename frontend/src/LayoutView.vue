<script setup lang="ts">
import SideMenu from './components/SideMenu.vue'
import BotonVolver from './components/BotonVolver.vue'
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <SideMenu />
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="navbar bg-base-100 shadow-sm px-4">
        <BotonVolver />
      </header>
      <main class="flex-1 min-w-0 p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
