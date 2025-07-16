<template>
  <div class="relative">
    <button
      @click="toggleMenu"
      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
    >
      <!-- Photo de profil -->
      <div class="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
        <span class="text-white text-sm font-medium">
          {{ userInitials }}
        </span>
      </div>
      
      <!-- Nom et rôle -->
      <div class="hidden md:block text-left">
        <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
        <p class="text-xs text-gray-500 capitalize">{{ userRole }}</p>
      </div>
      
      <!-- Icône -->
      <ChevronDownIcon class="h-4 w-4 text-gray-500" />
    </button>

    <!-- Menu déroulant -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div class="py-2">
        <router-link
          to="/app/profile"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="closeMenu"
        >
          <UserIcon class="h-4 w-4 mr-3 text-gray-400" />
          Mon profil
        </router-link>
        
        <router-link
          to="/app/settings"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="closeMenu"
        >
          <CogIcon class="h-4 w-4 mr-3 text-gray-400" />
          Paramètres
        </router-link>
        
        <div class="border-t border-gray-200 my-2"></div>
        
        <button
          @click="showLogoutConfirm"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <ArrowRightOnRectangleIcon class="h-4 w-4 mr-3 text-gray-400" />
          Se déconnecter
        </button>
      </div>
    </div>
    
    <!-- Modal de confirmation de déconnexion -->
    <ConfirmModal
      :isOpen="showLogoutModal"
      title="Confirmation de déconnexion"
      message="Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre espace."
      confirmText="Se déconnecter"
      cancelText="Annuler"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import {
  ChevronDownIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const isOpen = ref(false)
const showLogoutModal = ref(false)

// Computed properties
const userInitials = computed(() => {
  if (!authStore.user) return 'U'
  const firstName = authStore.user.prenom || ''
  const lastName = authStore.user.nom || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
})

const userName = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.prenom} ${authStore.user.nom}`
})

const userRole = computed(() => {
  return authStore.user?.roles?.[0] || ''
})

// Methods
const toggleMenu = () => {
  console.log('Menu toggled:', !isOpen.value)
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const showLogoutConfirm = () => {
  isOpen.value = false // Fermer le menu utilisateur
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  showLogoutModal.value = false
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

// Click outside handler
const handleClickOutside = (event) => {
  const menuEl = event.target.closest('.relative')
  if (!menuEl) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>