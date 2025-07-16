<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main content -->
    <div 
      class="transition-all duration-300 ease-in-out"
      :class="appStore.sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'"
    >
      <!-- Top navigation -->
      <TopNavigation />
      
      <!-- Page content -->
      <main class="p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Breadcrumb -->
          <Breadcrumb class="mb-6" />
          
          <!-- Page content -->
          <router-view />
        </div>
      </main>
    </div>
    
    <!-- Notifications -->
    <NotificationContainer />
    
    <!-- Loading overlay -->
    <LoadingOverlay v-if="appStore.loading" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopNavigation from '@/components/layout/TopNavigation.vue'
import SimpleNotificationButton from '@/components/layout/SimpleNotificationButton.vue'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

// Gérer la responsive - fermer sidebar sur mobile
const handleResize = () => {
  if (window.innerWidth < 1024) {
    appStore.setSidebarOpen(false)
  } else {
    appStore.setSidebarOpen(true)
  }
}

onMounted(() => {
  console.log('=== DASHBOARD LAYOUT MOUNTED')
  // Initialiser l'état de la sidebar selon la taille d'écran
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // Initialiser le store d'authentification
  authStore.initialize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>