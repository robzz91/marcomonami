<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Annonces de livraison disponibles</h1>
      <p class="text-gray-600">Consultez les demandes de livraison en attente</p>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label-field">Urgence</label>
          <select v-model="filters.urgence" @change="loadAnnonces" class="input-field">
            <option value="">Toutes</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="faible">Faible</option>
          </select>
        </div>
        <div>
          <label class="label-field">Budget minimum</label>
          <input
            v-model.number="filters.budget_min"
            type="number"
            @change="loadAnnonces"
            class="input-field"
            placeholder="0"
            min="0"
            step="10"
          >
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="btn btn-secondary w-full">
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des annonces -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Chargement...
      </div>
    </div>

    <div v-else-if="annonces.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune annonce disponible</h3>
      <p class="mt-1 text-sm text-gray-500">Revenez plus tard pour voir de nouvelles demandes de livraison.</p>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="annonce in annonces"
        :key="annonce.id"
        class="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                  Livraison
                </span>
                <span v-if="annonce.urgence === 'haute'" class="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                  Urgent
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">{{ annonce.titre }}</h3>
              <p class="text-gray-600 mt-1 line-clamp-2">{{ annonce.description }}</p>
              
              <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-500">Départ</p>
                  <p class="font-medium text-gray-900">{{ annonce.adresse_depart }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Arrivée</p>
                  <p class="font-medium text-gray-900">{{ annonce.adresse_arrivee }}</p>
                </div>
              </div>

              <div class="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <div v-if="annonce.date_livraison_souhaitee">
                  <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(annonce.date_livraison_souhaitee) }}
                </div>
                <div v-if="annonce.poids_colis">
                  <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  {{ annonce.poids_colis }} kg
                </div>
                <div v-if="annonce.dimensions_colis">
                  <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  {{ annonce.dimensions_colis }}
                </div>
              </div>

              <div class="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <span>Client: {{ annonce.client_prenom }} {{ annonce.client_nom }}</span>
                <span>•</span>
                <span>{{ formatRelativeDate(annonce.date_creation) }}</span>
              </div>
            </div>
            
            <div class="ml-4 text-right">
              <p v-if="annonce.budget_max" class="text-2xl font-bold text-green-600">
                {{ annonce.budget_max }} €
              </p>
              <p v-else class="text-lg text-gray-500">
                Budget à négocier
              </p>
              <button
                @click="viewAnnonce(annonce)"
                class="mt-3 btn btn-primary btn-sm"
              >
                Voir détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="[
            page === pagination.page
              ? 'z-10 bg-green-50 border-green-500 text-green-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
            'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
          ]"
        >
          {{ page }}
        </button>
        
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Suivant
        </button>
      </nav>
    </div>

    <!-- Modal de détails -->
    <AnnonceDetailsLivreurModal
      v-if="selectedAnnonce"
      :annonce="selectedAnnonce"
      @close="selectedAnnonce = null"
      @accepted="onAnnonceAccepted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import AnnonceDetailsLivreurModal from '@/components/livreur/AnnonceDetailsLivreurModal.vue'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { notifySuccess, notifyError } = useNotifications()

// État
const annonces = ref([])
const loading = ref(false)
const selectedAnnonce = ref(null)
const filters = ref({
  urgence: '',
  budget_min: null
})
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// Computed
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.totalPages, pagination.value.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Méthodes
const loadAnnonces = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      statut: 'ouverte', // Seulement les annonces ouvertes
      ...filters.value
    }
    
    const response = await api.get('/annonces/for-role', { params })
    
    if (response.data.success) {
      annonces.value = response.data.data
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error)
    notifyError('Erreur', 'Impossible de charger les annonces')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    urgence: '',
    budget_min: null
  }
  pagination.value.page = 1
  loadAnnonces()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadAnnonces()
  }
}

const viewAnnonce = (annonce) => {
  selectedAnnonce.value = annonce
}

const onAnnonceAccepted = () => {
  selectedAnnonce.value = null
  loadAnnonces()
  notifySuccess('Succès', 'Vous avez accepté cette livraison')
}

// Helpers
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeDate = (date) => {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `Il y a ${minutes} minutes`
  if (hours < 24) return `Il y a ${hours} heures`
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Hier"
  if (days < 7) return `Il y a ${days} jours`
  return formatDate(date)
}

// Lifecycle
onMounted(() => {
  loadAnnonces()
})
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>