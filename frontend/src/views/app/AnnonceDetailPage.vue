<template>
  <div class="space-y-6">
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center py-12">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-400 mx-auto mb-4" />
      <p class="text-gray-600">{{ error }}</p>
      <router-link to="/app/annonces" class="mt-4 btn btn-secondary">
        Retour aux annonces
      </router-link>
    </div>

    <!-- Contenu de l'annonce -->
    <div v-else-if="annonce" class="max-w-4xl mx-auto">
      <!-- Header avec navigation -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="$router.go(-1)"
          class="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          Retour
        </button>
        
        <div class="flex space-x-2">
          <span
            :class="getTypeClass(annonce.type)"
            class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
          >
            {{ getTypeLabel(annonce.type) }}
          </span>
          <span
            :class="getUrgenceClass(annonce.urgence)"
            class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
          >
            {{ getUrgenceLabel(annonce.urgence) }}
          </span>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Détails de l'annonce -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Titre et description -->
          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ annonce.titre }}</h1>
            <p class="text-gray-700 text-lg leading-relaxed">{{ annonce.description }}</p>
          </div>

          <!-- Informations détaillées -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Détails</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center">
                <TagIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Catégorie</p>
                  <p class="font-medium">{{ annonce.categorie }}</p>
                </div>
              </div>
              
              <div class="flex items-center">
                <MapPinIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Localisation</p>
                  <p class="font-medium">{{ annonce.localisation }}</p>
                </div>
              </div>
              
              <div v-if="annonce.budget" class="flex items-center">
                <CurrencyEuroIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Budget</p>
                  <p class="font-medium">{{ annonce.budget }}€</p>
                </div>
              </div>
              
              <div v-if="annonce.date_souhaitee" class="flex items-center">
                <CalendarIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Date souhaitée</p>
                  <p class="font-medium">{{ formatDate(annonce.date_souhaitee) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations spécifiques -->
          <div v-if="annonce.type === 'livraison'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations de livraison</h2>
            <div class="space-y-4">
              <div v-if="annonce.adresse_depart" class="flex items-center">
                <MapPinIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Adresse de départ</p>
                  <p class="font-medium">{{ annonce.adresse_depart }}</p>
                </div>
              </div>
              
              <div v-if="annonce.adresse_arrivee" class="flex items-center">
                <MapPinIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Adresse d'arrivée</p>
                  <p class="font-medium">{{ annonce.adresse_arrivee }}</p>
                </div>
              </div>
              
              <div v-if="annonce.poids" class="flex items-center">
                <ScaleIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Poids du colis</p>
                  <p class="font-medium">{{ annonce.poids }} kg</p>
                </div>
              </div>
              
              <div v-if="annonce.dimensions" class="flex items-center">
                <CubeIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Dimensions</p>
                  <p class="font-medium">{{ annonce.dimensions }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="annonce.type === 'prestation'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations de prestation</h2>
            <div class="space-y-4">
              <div v-if="annonce.duree" class="flex items-center">
                <ClockIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm text-gray-500">Durée estimée</p>
                  <p class="font-medium">{{ annonce.duree }} heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar avec auteur et actions -->
        <div class="space-y-6">
          <!-- Informations de l'auteur -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Publié par</h3>
            <div class="flex items-center space-x-3 mb-4">
              <div class="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon class="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ annonce.auteur_nom }}</p>
                <div class="flex items-center">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="i <= annonce.auteur_note ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-4 w-4 fill-current"
                  />
                  <span class="ml-2 text-sm text-gray-500">({{ annonce.auteur_avis }})</span>
                </div>
              </div>
            </div>
            
            <div class="text-sm text-gray-500 mb-4">
              <p>Publié {{ formatTimeAgo(annonce.date_creation) }}</p>
              <p v-if="annonce.nombre_vues">{{ annonce.nombre_vues }} vues</p>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="!isOwnAnnonce" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div class="space-y-3">
              <!-- Bouton Contact/Message -->
              <button
                @click="contactAuthor"
                :disabled="isContactingAuthor"
                class="w-full btn btn-primary flex items-center justify-center"
              >
                <ChatBubbleLeftRightIcon class="h-5 w-5 mr-2" />
                <span v-if="isContactingAuthor" class="spinner mr-2"></span>
                Contacter l'auteur
              </button>
              
              <!-- Bouton spécifique selon le type -->
              <button
                v-if="annonce.type === 'prestation' && authStore.userRole !== 'client'"
                @click="proposeService"
                class="w-full btn btn-secondary flex items-center justify-center"
              >
                <HandRaisedIcon class="h-5 w-5 mr-2" />
                Proposer mes services
              </button>
              
              <button
                v-if="annonce.type === 'livraison' && authStore.userRole === 'livreur'"
                @click="proposeDelivery"
                class="w-full btn btn-secondary flex items-center justify-center"
              >
                <TruckIcon class="h-5 w-5 mr-2" />
                Proposer une livraison
              </button>
            </div>
          </div>

          <!-- Message si c'est sa propre annonce -->
          <div v-else class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center">
              <InformationCircleIcon class="h-5 w-5 text-blue-400 mr-2" />
              <p class="text-sm text-blue-700">Ceci est votre annonce</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de contact -->
    <div
      v-if="showContactModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showContactModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Contacter {{ annonce.auteur_nom }}
          </h3>
          
          <form @submit.prevent="sendContactMessage" class="space-y-4">
            
            <div>
              <label class="label-field">Message</label>
              <textarea
                v-model="contactForm.message"
                class="input-field"
                rows="4"
                placeholder="Votre message..."
                required
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showContactModal = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSendingMessage"
                class="btn btn-primary"
              >
                <span v-if="isSendingMessage" class="spinner mr-2"></span>
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { communService } from '@/services/communService'
import { useNotifications } from '@/composables/useNotifications'
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  TagIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ClockIcon,
  ScaleIcon,
  CubeIcon,
  UserIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  TruckIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isContactingAuthor = ref(false)
const isSendingMessage = ref(false)
const showContactModal = ref(false)
const annonce = ref(null)
const error = ref(null)

// Formulaire de contact
const contactForm = ref({
  message: ''
})

// Computed
const isOwnAnnonce = computed(() => {
  if (!annonce.value || !authStore.user) return false
  return annonce.value.auteur_id === authStore.user.id
})

// Méthodes
const loadAnnonce = async () => {
  try {
    isLoading.value = true
    const annonceId = route.params.id
    
    const response = await communService.getAnnonce(annonceId)
    annonce.value = response
    
    
  } catch (err) {
    error.value = 'Annonce non trouvée ou erreur de chargement'
    handleApiError(err, 'Impossible de charger l\'annonce')
  } finally {
    isLoading.value = false
  }
}

const contactAuthor = () => {
  showContactModal.value = true
}

const sendContactMessage = async () => {
  try {
    isSendingMessage.value = true
    
    await communService.contactAuthor(annonce.value.id, {
      message: contactForm.value.message
    })
    
    notifySuccess('Message envoyé', 'Votre message a été envoyé avec succès')
    showContactModal.value = false
    
    // Rediriger vers la messagerie après un délai
    setTimeout(() => {
      router.push('/app/messages')
    }, 1500)
    
  } catch (err) {
    handleApiError(err, 'Impossible d\'envoyer le message')
  } finally {
    isSendingMessage.value = false
  }
}

const proposeService = () => {
  // Rediriger vers la page de proposition ou ouvrir un modal
  notifyInfo('Fonctionnalité en développement', 'La proposition de service sera bientôt disponible')
}

const proposeDelivery = async () => {
  if (!confirm('Êtes-vous sûr de vouloir proposer cette livraison ?')) {
    return
  }
  
  try {
    const response = await fetch('/api/livraisons/propose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        annonceId: annonce.value.id
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      notifySuccess('Proposition envoyée', 'Votre proposition de livraison a été envoyée au client')
      // Rediriger vers mes livraisons
      setTimeout(() => {
        router.push('/app/livreur/livraisons')
      }, 2000)
    } else {
      notifyError('Erreur', data.error || 'Impossible de proposer cette livraison')
    }
  } catch (error) {
    console.error('Erreur proposition livraison:', error)
    notifyError('Erreur', 'Impossible de proposer cette livraison')
  }
}

// Utilitaires
const getTypeClass = (type) => {
  const classes = {
    prestation: 'bg-blue-100 text-blue-800',
    livraison: 'bg-green-100 text-green-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type) => {
  const labels = {
    prestation: 'Demande de service',
    livraison: 'Offre de livraison'
  }
  return labels[type] || type
}

const getUrgenceClass = (urgence) => {
  const classes = {
    faible: 'bg-gray-100 text-gray-800',
    normale: 'bg-blue-100 text-blue-800',
    haute: 'bg-red-100 text-red-800'
  }
  return classes[urgence] || 'bg-gray-100 text-gray-800'
}

const getUrgenceLabel = (urgence) => {
  const labels = {
    faible: 'Faible',
    normale: 'Normale',
    haute: 'Haute'
  }
  return labels[urgence] || urgence
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const created = new Date(date)
  const diffMs = now - created
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return 'à l\'instant'
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  
  return formatDate(date)
}

// Watchers
watch(() => annonce.value?.titre, (newTitre) => {
  if (newTitre) {
    document.title = `${newTitre} - EcoDeli`
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadAnnonce()
})
</script>