<template>
  <div class="h-full flex bg-white shadow rounded-lg overflow-hidden">
    <!-- Liste des conversations -->
    <div class="w-1/3 border-r border-gray-200 flex flex-col">
      <!-- Header conversations -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Messages</h2>
        </div>
        
        <!-- Recherche -->
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            class="input-field pl-10"
            placeholder="Rechercher une conversation..."
          />
        </div>
      </div>
      
      <!-- Liste des conversations -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoadingConversations" class="p-4 text-center">
          <div class="spinner mx-auto"></div>
        </div>
        
        <div v-else-if="filteredConversations.length === 0" class="p-4 text-center text-gray-500">
          Aucune conversation
        </div>
        
        <div v-else>
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            @click="selectConversation(conversation)"
            :class="{
              'bg-primary-50 border-r-2 border-primary-500': selectedConversation?.interlocuteur_id === conversation.interlocuteur_id,
              'hover:bg-gray-50': selectedConversation?.interlocuteur_id !== conversation.interlocuteur_id
            }"
            class="p-4 border-b border-gray-100 cursor-pointer transition-colors"
          >
            <div class="flex items-start space-x-3">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon class="h-6 w-6 text-gray-600" />
                </div>
                <div v-if="conversation.en_ligne" class="absolute -mt-2 -mr-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              
              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {{ conversation.participant_nom }}
                  </h3>
                  <time class="text-xs text-gray-500">
                    {{ formatTime(conversation.dernier_message_date) }}
                  </time>
                </div>
                
                <div class="flex items-center justify-between mt-1">
                  <p class="text-sm text-gray-600 truncate">
                    {{ conversation.dernier_message }}
                  </p>
                  <div v-if="conversation.non_lus > 0" class="ml-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ conversation.non_lus }}
                  </div>
                </div>
                
                <div class="mt-1 flex items-center space-x-2">
                  <span class="text-xs text-gray-500">{{ conversation.participant_role }}</span>
                  <span v-if="conversation.prestation_titre" class="text-xs text-blue-600">
                    • {{ conversation.prestation_titre }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone de chat -->
    <div class="flex-1 flex flex-col">
      <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <ChatBubbleLeftRightIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
          <p class="text-gray-600">Choisissez une conversation dans la liste pour commencer à discuter</p>
        </div>
      </div>
      
      <div v-else class="flex-1 flex flex-col">
        <!-- Header de la conversation -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon class="h-6 w-6 text-gray-600" />
                </div>
                <div v-if="selectedConversation.en_ligne" class="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ selectedConversation.participant_nom }}</h3>
                <p class="text-xs text-gray-500">
                  {{ selectedConversation.en_ligne ? 'En ligne' : 'Hors ligne' }}
                  <span v-if="selectedConversation.prestation_titre" class="ml-2">
                    • {{ selectedConversation.prestation_titre }}
                  </span>
                </p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="archiveConversation"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArchiveBoxIcon class="h-5 w-5" />
              </button>
              <button
                @click="deleteConversation"
                class="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="isLoadingMessages" class="text-center">
            <div class="spinner mx-auto"></div>
          </div>
          
          <div v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="{
                'justify-end': message.expediteur_id === currentUserId,
                'justify-start': message.expediteur_id !== currentUserId
              }"
              class="flex mb-3"
            >
              <div
                :class="{
                  'bg-primary-600 text-white': message.expediteur_id === currentUserId,
                  'bg-gray-200 text-gray-900': message.expediteur_id !== currentUserId
                }"
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
              >
                <p class="text-sm">{{ message.contenu }}</p>
                <div class="flex items-center justify-between mt-1">
                  <time class="text-xs opacity-75">
                    {{ formatDateTime(message.date_envoi) }}
                  </time>
                  <div v-if="message.expediteur_id === currentUserId" class="ml-2">
                    <CheckIcon v-if="message.lu" class="h-3 w-3 opacity-75" />
                    <ClockIcon v-else class="h-3 w-3 opacity-75" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Zone de saisie -->
        <div class="p-4 border-t border-gray-200">
          <form @submit.prevent="sendMessage" class="flex space-x-2">
            <div class="flex-1">
              <textarea
                v-model="newMessage"
                rows="2"
                class="input-field resize-none"
                placeholder="Tapez votre message..."
                @keydown.enter.prevent="sendMessage"
              ></textarea>
            </div>
            <button
              type="submit"
              :disabled="!newMessage.trim() || isSending"
              class="btn btn-primary self-end"
            >
              <PaperAirplaneIcon class="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { communService } from '@/services/communService'
import { useNotifications } from '@/composables/useNotifications'
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  CheckIcon,
  ClockIcon,
  ArchiveBoxIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const appStore = useAppStore()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoadingConversations = ref(true)
const isLoadingMessages = ref(false)
const isSending = ref(false)
const searchQuery = ref('')
const conversations = ref([])
const messages = ref([])
const selectedConversation = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)


// Utilisateur actuel
const currentUserId = computed(() => authStore.user?.id)

// Computed
const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  
  const query = searchQuery.value.toLowerCase()
  return conversations.value.filter(conv =>
    conv.participant_nom.toLowerCase().includes(query) ||
    conv.dernier_message.toLowerCase().includes(query) ||
    (conv.prestation_titre && conv.prestation_titre.toLowerCase().includes(query))
  )
})

// Méthodes
const loadConversations = async () => {
  try {
    isLoadingConversations.value = true
    
    const response = await communService.getConversations({
      search: searchQuery.value
    })
    
    conversations.value = response.conversations || []
  } catch (error) {
    handleApiError(error, 'Impossible de charger les conversations')
  } finally {
    isLoadingConversations.value = false
  }
}

const selectConversation = async (conversation) => {
  selectedConversation.value = conversation
  
  // Marquer les messages comme lus
  if (conversation.non_lus > 0) {
    try {
      await communService.markAsRead(conversation.interlocuteur_id)
      conversation.non_lus = 0
    } catch (error) {
      handleApiError(error, 'Impossible de marquer les messages comme lus')
    }
  }
  
  await loadMessages(conversation.interlocuteur_id)
}

const loadMessages = async (interlocuteurId) => {
  try {
    console.log('=== FRONTEND loadMessages called with interlocuteurId:', interlocuteurId)
    isLoadingMessages.value = true
    
    const response = await communService.getMessages(interlocuteurId)
    console.log('=== FRONTEND loadMessages response:', response)
    messages.value = response.messages || []
    console.log('=== FRONTEND loadMessages messages set:', messages.value.length)
    
    // Faire défiler vers le bas
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('=== FRONTEND loadMessages error:', error)
    handleApiError(error, 'Impossible de charger les messages')
  } finally {
    isLoadingMessages.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  
  try {
    console.log('=== FRONTEND sendMessage called with:', {
      interlocuteur_id: selectedConversation.value.interlocuteur_id,
      contenu: newMessage.value.trim()
    })
    isSending.value = true
    
    const messageData = {
      contenu: newMessage.value.trim()
    }
    
    const response = await communService.sendMessage(selectedConversation.value.interlocuteur_id, messageData)
    console.log('=== FRONTEND sendMessage response:', response)
    
    // Ajouter le message à la liste
    if (response.message) {
      messages.value.push(response.message)
    }
    
    // Mettre à jour la conversation
    selectedConversation.value.dernier_message = messageData.contenu
    selectedConversation.value.dernier_message_date = new Date().toISOString()
    
    // Vider le champ de saisie
    newMessage.value = ''
    
    // Faire défiler vers le bas
    await nextTick()
    scrollToBottom()
  } catch (error) {
    handleApiError(error, 'Impossible d\'envoyer le message')
  } finally {
    isSending.value = false
  }
}


const archiveConversation = async () => {
  if (!confirm('Archiver cette conversation ?')) return
  
  try {
    await communService.archiveConversation(selectedConversation.value.interlocuteur_id)
    
    notifySuccess('Conversation archivée', 'La conversation a été archivée')
    
    // Retirer de la liste
    const index = conversations.value.findIndex(c => c.interlocuteur_id === selectedConversation.value.interlocuteur_id)
    if (index > -1) {
      conversations.value.splice(index, 1)
    }
    
    selectedConversation.value = null
    messages.value = []
  } catch (error) {
    handleApiError(error, 'Impossible d\'archiver la conversation')
  }
}

const deleteConversation = async () => {
  if (!confirm('Supprimer définitivement cette conversation ?')) return
  
  try {
    await communService.deleteConversation(selectedConversation.value.interlocuteur_id)
    
    notifySuccess('Conversation supprimée', 'La conversation a été supprimée')
    
    // Retirer de la liste
    const index = conversations.value.findIndex(c => c.interlocuteur_id === selectedConversation.value.interlocuteur_id)
    if (index > -1) {
      conversations.value.splice(index, 1)
    }
    
    selectedConversation.value = null
    messages.value = []
  } catch (error) {
    handleApiError(error, 'Impossible de supprimer la conversation')
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (date) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Hier'
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString('fr-FR', { weekday: 'short' })
  } else {
    return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Watch pour faire défiler automatiquement
watch(() => messages.value.length, () => {
  nextTick(() => scrollToBottom())
})

// Watch pour recharger les conversations quand la recherche change
let searchDebounceTimer = null
watch(searchQuery, () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    loadConversations()
  }, 300)
})

// Lifecycle
onMounted(async () => {
  await loadConversations()
  
  // Vérifier si on doit ouvrir une conversation spécifique
  const userIdParam = route.query.user
  if (userIdParam) {
    const targetConversation = conversations.value.find(
      conv => conv.interlocuteur_id === parseInt(userIdParam)
    )
    if (targetConversation) {
      await selectConversation(targetConversation)
    }
  }
})
</script>