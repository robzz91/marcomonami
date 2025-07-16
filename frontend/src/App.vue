<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const appStore = useAppStore()

onMounted(() => {
  // Initialiser le store d'authentification
  authStore.initialize()
  
  // Initialiser le thème
  appStore.initializeTheme()
})
</script>