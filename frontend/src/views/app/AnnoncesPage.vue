<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Annonces publiques</h1>
        <p class="text-gray-600">Découvrez les demandes et offres de la communauté</p>
      </div>
      <router-link 
        :to="getMyAnnoncesRoute()"
        class="btn btn-primary"
      >
        Mes annonces
      </router-link>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="space-y-4">
        <!-- Barre de recherche -->
        <div class="flex space-x-4">
          <div class="flex-1">
            <input
              type="text"
              v-model="searchQuery"
              class="input-field"
              placeholder="Rechercher une annonce, un service, une localisation..."
            />
          </div>
          <div>
            <select v-model="selectedLocation" class="input-field">
              <option value="">Toutes les localisations</option>
              <option value="paris">Paris</option>
              <option value="lyon">Lyon</option>
              <option value="marseille">Marseille</option>
              <option value="toulouse">Toulouse</option>
            </select>
          </div>
          <div>
            <button
              @click="toggleFilters"
              :class="[
                'btn btn-secondary flex items-center',
                hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
              ]"
            >
              <FunnelIcon class="h-4 w-4 mr-2" />
              Filtres
              <span v-if="hasActiveFilters" class="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ activeFiltersCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Filtres avancés -->
        <div v-if="showFilters" class="pt-4 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="label-field">Type</label>
              <select v-model="filters.type" class="input-field">
                <option value="">Tous les types</option>
                <option value="prestation">Demandes de service</option>
                <option value="livraison">Offres de livraison</option>
              </select>
            </div>
            <div v-if="filters.type === 'prestation'">
              <label class="label-field">Catégorie de service</label>
              <select v-model="filters.categorie" class="input-field">
                <option value="">Toutes les catégories</option>
                <option value="menage">Ménage</option>
                <option value="jardinage">Jardinage</option>
                <option value="bricolage">Bricolage</option>
                <option value="demenagement">Déménagement</option>
                <option value="informatique">Informatique</option>
                <option value="cours">Cours particuliers</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label class="label-field">Budget max (€)</label>
              <input
                type="number"
                v-model="filters.budgetMax"
                class="input-field"
                placeholder="1000"
                min="0"
              />
            </div>
            <div>
              <label class="label-field">Urgence</label>
              <select v-model="filters.urgence" class="input-field">
                <option value="">Toutes</option>
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="faible">Faible</option>
              </select>
            </div>
          </div>
          
          <!-- Bouton pour réinitialiser les filtres -->
          <div class="flex justify-end mt-4">
            <button
              @click="resetFilters"
              class="btn btn-secondary flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <MegaphoneIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total annonces</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ArrowTrendingUpIcon class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Nouvelles aujourd'hui</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.nouvelles }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <HandRaisedIcon class="h-8 w-8 text-purple-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Demandes actives</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.demandes }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <GiftIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Offres disponibles</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.offres }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des annonces -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>

    <div v-else-if="filteredAnnonces.length === 0" class="text-center py-12">
      <MegaphoneIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">Aucune annonce trouvée pour vos critères</p>
      <button
        @click="resetFilters"
        class="mt-4 btn btn-secondary"
      >
        Réinitialiser les filtres
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="annonce in filteredAnnonces"
        :key="annonce.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      >
        <!-- Header de l'annonce -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
              <span
                :class="getTypeClass(annonce.type)"
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getTypeLabel(annonce.type) }}
              </span>
              <span
                :class="getUrgenceClass(annonce.urgence)"
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getUrgenceLabel(annonce.urgence) }}
              </span>
            </div>
            <div v-if="annonce.budget" class="text-right">
              <span class="text-lg font-bold text-primary-600">{{ annonce.budget }}€</span>
            </div>
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ annonce.titre }}</h3>
          <p class="text-gray-600 mb-4 line-clamp-3">{{ annonce.description }}</p>
          
          <!-- Détails -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-500">
              <TagIcon class="h-4 w-4 mr-2" />
              <span>{{ annonce.categorie }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <MapPinIcon class="h-4 w-4 mr-2" />
              <span>{{ annonce.localisation }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <CalendarIcon class="h-4 w-4 mr-2" />
              <span>Publié {{ formatTimeAgo(annonce.date_creation) }}</span>
            </div>
            <div v-if="annonce.date_souhaitee" class="flex items-center text-sm text-gray-500">
              <ClockIcon class="h-4 w-4 mr-2" />
              <span>Pour le {{ formatDate(annonce.date_souhaitee) }}</span>
            </div>
          </div>
          
          <!-- Auteur -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon class="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ annonce.auteur_nom }}</p>
                <div class="flex items-center">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="i <= annonce.auteur_note ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-3 w-3 fill-current"
                  />
                  <span class="ml-1 text-xs text-gray-500">({{ annonce.auteur_avis }})</span>
                </div>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button
                @click="viewAnnonce(annonce)"
                class="btn btn-secondary text-sm"
              >
                Voir détails
              </button>
              <button
                v-if="annonce.type === 'prestation' && authStore.userRole !== 'client'"
                @click="proposeService(annonce)"
                class="btn btn-primary text-sm"
              >
                Proposer mes services
              </button>
              <button
                v-if="annonce.type === 'livraison' && authStore.userRole === 'livreur'"
                @click="proposeDelivery(annonce)"
                class="btn btn-primary text-sm"
              >
                Proposer livraison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de proposition -->
    <div
      v-if="showProposeModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showProposeModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Proposer mes services
          </h3>
          
          <div v-if="selectedAnnonce" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900">{{ selectedAnnonce.titre }}</h4>
              <p class="text-sm text-gray-600">{{ selectedAnnonce.auteur_nom }}</p>
              <p v-if="selectedAnnonce.budget" class="text-sm text-primary-600 font-medium">
                Budget : {{ selectedAnnonce.budget }}€
              </p>
            </div>
            
            <form @submit.prevent="submitProposal" class="space-y-4">
              <div>
                <label class="label-field">Votre prix (€)</label>
                <input
                  v-model="proposalForm.prix"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field"
                  placeholder="Prix proposé"
                  required
                />
              </div>
              
              <div>
                <label class="label-field">Délai de réalisation</label>
                <select v-model="proposalForm.delai" class="input-field" required>
                  <option value="">Sélectionner un délai</option>
                  <option value="immediate">Immédiat</option>
                  <option value="24h">Sous 24h</option>
                  <option value="48h">Sous 48h</option>
                  <option value="semaine">Cette semaine</option>
                  <option value="autre">Autre (préciser dans le message)</option>
                </select>
              </div>
              
              <div>
                <label class="label-field">Message de présentation</label>
                <textarea
                  v-model="proposalForm.message"
                  class="input-field"
                  rows="4"
                  placeholder="Présentez votre proposition et votre expérience..."
                  required
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="showProposeModal = false"
                  class="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isSubmittingProposal"
                  class="btn btn-primary"
                >
                  <span v-if="isSubmittingProposal" class="spinner mr-2"></span>
                  Envoyer la proposition
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { communService } from '@/services/communService'
import { useNotifications } from '@/composables/useNotifications'
import {
  MegaphoneIcon,
  ArrowTrendingUpIcon,
  HandRaisedIcon,
  GiftIcon,
  FunnelIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const { notifySuccess, notifyInfo, notifyError, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isSubmittingProposal = ref(false)
const showFilters = ref(false)
const showProposeModal = ref(false)
const searchQuery = ref('')
const selectedLocation = ref('')
const annonces = ref([])
const selectedAnnonce = ref(null)

// Filtres
const filters = ref({
  type: '',
  categorie: '',
  budgetMax: '',
  urgence: ''
})

// Formulaire de proposition
const proposalForm = ref({
  prix: '',
  delai: '',
  message: ''
})


// Statistiques
const stats = ref({
  total: 0,
  nouvelles: 0,
  demandes: 0,
  offres: 0
})

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         selectedLocation.value || 
         filters.value.type || 
         filters.value.categorie || 
         filters.value.budgetMax || 
         filters.value.urgence
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (selectedLocation.value) count++
  if (filters.value.type) count++
  if (filters.value.categorie) count++
  if (filters.value.budgetMax) count++
  if (filters.value.urgence) count++
  return count
})

const filteredAnnonces = computed(() => {
  let filtered = annonces.value

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.titre.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.categorie.toLowerCase().includes(query) ||
      a.localisation.toLowerCase().includes(query)
    )
  }

  // Filtres
  if (selectedLocation.value) {
    filtered = filtered.filter(a =>
      a.localisation.toLowerCase().includes(selectedLocation.value.toLowerCase())
    )
  }

  if (filters.value.type) {
    filtered = filtered.filter(a => a.type === filters.value.type)
  }

  if (filters.value.categorie) {
    filtered = filtered.filter(a => a.categorie === filters.value.categorie)
  }

  if (filters.value.budgetMax) {
    filtered = filtered.filter(a => !a.budget || a.budget <= parseInt(filters.value.budgetMax))
  }

  if (filters.value.urgence) {
    filtered = filtered.filter(a => a.urgence === filters.value.urgence)
  }

  return filtered.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
})

// Méthodes
const loadAnnonces = async () => {
  try {
    isLoading.value = true
    
    const searchFilters = {
      search: searchQuery.value,
      location: selectedLocation.value,
      type: filters.value.type,
      categorie: filters.value.categorie,
      budget_max: filters.value.budgetMax,
      urgence: filters.value.urgence
    }
    
    const [annoncesResponse, statsResponse] = await Promise.all([
      communService.getAnnoncesPubliques(searchFilters),
      communService.getPublicStats()
    ])
    
    annonces.value = annoncesResponse.annonces || []
    stats.value = statsResponse || {
      total: 0,
      nouvelles: 0,
      demandes: 0,
      offres: 0
    }
    
  } catch (error) {
    handleApiError(error, 'Impossible de charger les annonces')
  } finally {
    isLoading.value = false
  }
}

const getMyAnnoncesRoute = () => {
  const role = authStore.userRole
  if (role === 'client') return '/app/client/annonces'
  // Les autres rôles peuvent aussi avoir des annonces
  return '/app/client/annonces'
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}


const resetFilters = () => {
  searchQuery.value = ''
  selectedLocation.value = ''
  filters.value = {
    type: '',
    categorie: '',
    budgetMax: '',
    urgence: ''
  }
  // Optionnel : fermer la section des filtres après réinitialisation
  // showFilters.value = false
}

const viewAnnonce = (annonce) => {
  router.push(`/app/annonces/${annonce.id}`)
}

const proposeService = (annonce) => {
  selectedAnnonce.value = annonce
  proposalForm.value = { prix: '', delai: '', message: '' }
  showProposeModal.value = true
}

const contactAuthor = async (annonce) => {
  try {
    const messageData = {
      objet: `Intérêt pour votre annonce: ${annonce.titre}`,
      message: `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${annonce.titre}".\nPouvez-vous me donner plus de détails ?\n\nCordialement`
    }
    
    const response = await communService.contactAuthor(annonce.id, messageData)
    
    notifySuccess('Message envoyé', 'Votre message a été envoyé à l\'auteur de l\'annonce')
    
    // Rediriger vers la messagerie après un délai
    setTimeout(() => {
      router.push('/app/messages')
    }, 1500)
  } catch (error) {
    handleApiError(error, 'Impossible de contacter l\'auteur')
  }
}

const proposeDelivery = async (annonce) => {
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
        annonceId: annonce.id
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

const submitProposal = async () => {
  try {
    isSubmittingProposal.value = true
    
    const proposalData = {
      prix: parseFloat(proposalForm.value.prix),
      delai: proposalForm.value.delai,
      message: proposalForm.value.message
    }
    
    await communService.proposeService(selectedAnnonce.value.id, proposalData)
    
    notifySuccess('Proposition envoyée', 'Votre proposition a été envoyée avec succès')
    
    showProposeModal.value = false
    proposalForm.value = { prix: '', delai: '', message: '' }
  } catch (error) {
    handleApiError(error, 'Impossible d\'envoyer la proposition')
  } finally {
    isSubmittingProposal.value = false
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

// Watcher pour réinitialiser la catégorie quand on change de type
watch(() => filters.value.type, (newType, oldType) => {
  if (newType !== oldType && filters.value.categorie) {
    filters.value.categorie = ''
  }
})

// Watchers pour recharger les données quand les filtres changent
let debounceTimer = null
watch([searchQuery, selectedLocation, () => filters.value], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadAnnonces()
  }, 300)
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadAnnonces()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>