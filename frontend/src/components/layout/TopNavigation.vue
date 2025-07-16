<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Mobile menu button -->
      <button
        @click="appStore.toggleSidebar"
        class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>

      <!-- Search bar (desktop) -->
      <div class="hidden md:block flex-1 max-w-md mx-8">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Right section -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            @click.stop="toggleNotifications"
            class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative"
            style="z-index: 50;"
          >
            <BellIcon class="h-6 w-6" />
            <span 
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Dropdown notifications -->
          <div
            v-if="showNotifications"
            id="notifications-dropdown"
            class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
                Aucune notification
              </div>
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div 
                      class="h-2 w-2 rounded-full"
                      :class="notification.lue ? 'bg-gray-300' : 'bg-primary-500'"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">
                      {{ notification.title }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ notification.message }}
                    </p>
                    <div class="flex items-center justify-between mt-2">
                      <p class="text-xs text-gray-400">
                        {{ formatDate(notification.created_at) }}
                      </p>
                      <span v-if="notification.non_lus > 1" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {{ notification.non_lus }} messages non lus
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Pas de bouton "Tout marquer comme lu" -->
          </div>
        </div>

        <!-- User menu -->
        <UserMenu />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { communService } from '@/services/communService'
import UserMenu from './UserMenu.vue'

// Heroicons
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const showNotifications = ref(false)
const notifications = ref([])

// State
const unreadCount = ref(0)

// Computed - inutile maintenant

// Methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // Implémenter la recherche
    console.log('Recherche:', searchQuery.value)
  }
}


const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Click outside handler
const handleClickOutside = (event) => {
  const notificationsEl = document.getElementById('notifications-dropdown')
  
  if (notificationsEl && !notificationsEl.contains(event.target)) {
    showNotifications.value = false
  }
}

// Charger les notifications de messages non lus
const loadNotifications = async () => {
  try {
    console.log('=== LOAD NOTIFICATIONS called')
    
    // Récupérer les conversations avec des messages non lus
    const response = await communService.getConversations()
    console.log('=== LOAD NOTIFICATIONS conversations response:', response)
    
    // Transformer les conversations en notifications
    const messageNotifications = []
    if (response.conversations) {
      response.conversations.forEach(conv => {
        if (conv.non_lus > 0) {
          messageNotifications.push({
            id: `conv-${conv.interlocuteur_id}`,
            title: `Message de ${conv.participant_nom}`,
            message: conv.dernier_message,
            lue: false,
            created_at: conv.dernier_message_date,
            type: 'message',
            interlocuteur_id: conv.interlocuteur_id,
            non_lus: conv.non_lus
          })
        }
      })
    }
    
    notifications.value = messageNotifications
    console.log('=== LOAD NOTIFICATIONS notifications set:', notifications.value)
    updateUnreadCount()
    console.log('=== LOAD NOTIFICATIONS unreadCount set:', unreadCount.value)
  } catch (error) {
    console.error('=== LOAD NOTIFICATIONS error:', error)
  }
}

// Gérer le clic sur une notification
const handleNotificationClick = (notification) => {
  console.log('=== NOTIFICATION CLICKED:', notification)
  
  // Si c'est une notification de message, rediriger vers la conversation
  if (notification.type === 'message' && notification.interlocuteur_id) {
    showNotifications.value = false
    router.push(`/app/messages?user=${notification.interlocuteur_id}`)
  }
  
  // Recharger les notifications après un délai pour mettre à jour
  setTimeout(() => {
    loadNotifications()
  }, 1000)
}

// Supprimer le bouton "Marquer tout comme lu" car on veut que les notifications disparaissent seulement quand on lit le message
const markAllAsRead = () => {
  // Fonction désactivée
}

// Mettre à jour le compteur
const updateUnreadCount = () => {
  unreadCount.value = notifications.value.filter(n => !n.lue).length
}

// Toggle notifications dropdown
const toggleNotifications = (event) => {
  console.log('=== TOGGLE NOTIFICATIONS clicked, current state:', showNotifications.value)
  console.log('=== Event:', event)
  showNotifications.value = !showNotifications.value
  console.log('=== TOGGLE NOTIFICATIONS new state:', showNotifications.value)
  console.log('=== TOGGLE NOTIFICATIONS unreadCount:', unreadCount.value)
  console.log('=== TOGGLE NOTIFICATIONS notifications:', notifications.value)
  
  // Empêcher la propagation
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
}

// Charger les notifications au montage
onMounted(() => {
  console.log('=== TOPNAVIGATION MOUNTED')
  loadNotifications()
  
  // Recharger périodiquement
  const interval = setInterval(loadNotifications, 30000) // toutes les 30 secondes
  
  onUnmounted(() => {
    clearInterval(interval)
  })
  
  // Ajouter l'event listener pour fermer les menus
  document.addEventListener('click', handleClickOutside)
  
  // Debug - vérifier que le bouton existe
  setTimeout(() => {
    const allButtons = document.querySelectorAll('button')
    console.log('=== TOUS LES BOUTONS:', allButtons.length)
    allButtons.forEach((btn, index) => {
      if (btn.innerHTML.includes('BellIcon')) {
        console.log(`=== BOUTON NOTIFICATION TROUVÉ à l'index ${index}`)
        btn.addEventListener('click', () => {
          console.log('=== CLICK DIRECT SUR LE BOUTON NOTIFICATION')
        })
      }
    })
  }, 1000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>