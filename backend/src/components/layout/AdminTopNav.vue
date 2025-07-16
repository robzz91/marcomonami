<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- Page title will be inserted here by individual pages -->
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ pageTitle }}
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Bouton de déconnexion -->
          <button
            @click="handleLogout"
            class="p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full"
            title="Se déconnecter"
          >
            <ArrowRightOnRectangleIcon class="h-6 w-6" />
          </button>
          
          <!-- User info -->
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <span class="text-gray-700 font-medium">{{ authStore.userName }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/dateHelper'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State (plus besoin de showUserMenu)

// Computed
const pageTitle = computed(() => {
  const titles = {
    'Dashboard': 'Tableau de bord',
    'UsersManagement': 'Gestion des utilisateurs',
    'UserDetails': 'Détails utilisateur',
    'Moderation': 'Modération',
    'Reports': 'Rapports',
    'Settings': 'Paramètres',
    'Announcements': 'Gestion des annonces',
    'Services': 'Gestion des services',
    'Deliveries': 'Gestion des livraisons',
    'Finances': 'Finances'
  }
  return titles[route.name] || 'Administration'
})

const userInitials = computed(() => {
  if (!authStore.user) return 'A'
  const { nom, prenom } = authStore.user
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
})

// Methods

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}


// Plus besoin de la directive click-outside

</script>