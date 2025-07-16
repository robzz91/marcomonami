<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes annonces</h1>
        <p class="text-gray-600">Gérez vos annonces de livraison et demandes de prestation</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle annonce
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Type</label>
          <select v-model="filters.type_annonce" @change="loadAnnonces" class="input-field">
            <option value="">Tous les types</option>
            <option value="livraison">Livraison</option>
            <option value="prestation">Prestation</option>
          </select>
        </div>
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" @change="loadAnnonces" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="ouverte">Ouverte</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div>
          <label class="label-field">Urgence</label>
          <select v-model="filters.urgence" @change="loadAnnonces" class="input-field">
            <option value="">Toutes</option>
            <option value="faible">Faible</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
          </select>
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
      <p class="mt-1 text-sm text-gray-500">Commencez par créer votre première annonce.</p>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="annonce in annonces"
        :key="annonce.id"
        class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="viewAnnonce(annonce)"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span :class="getTypeClass(annonce.type_annonce)" class="px-2 py-1 text-xs font-medium rounded">
                  {{ annonce.type_annonce === 'livraison' ? 'Livraison' : 'Prestation' }}
                </span>
                <span :class="getStatutClass(annonce.statut)" class="px-2 py-1 text-xs font-medium rounded">
                  {{ getStatutLabel(annonce.statut) }}
                </span>
                <span v-if="annonce.urgence === 'haute'" class="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                  Urgent
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">{{ annonce.titre }}</h3>
              <p class="text-gray-600 mt-1 line-clamp-2">{{ annonce.description }}</p>
              
              <div class="mt-3 space-y-1 text-sm text-gray-500">
                <div v-if="annonce.type_annonce === 'livraison'">
                  <p><strong>De:</strong> {{ annonce.adresse_depart }}</p>
                  <p><strong>À:</strong> {{ annonce.adresse_arrivee }}</p>
                  <p v-if="annonce.date_livraison_souhaitee">
                    <strong>Date souhaitée:</strong> {{ formatDate(annonce.date_livraison_souhaitee) }}
                  </p>
                </div>
                <div v-else>
                  <p><strong>Type:</strong> {{ annonce.type_prestation }}</p>
                  <p v-if="annonce.date_prestation_souhaitee">
                    <strong>Date souhaitée:</strong> {{ formatDate(annonce.date_prestation_souhaitee) }}
                  </p>
                  <p v-if="annonce.duree_estimee_heures">
                    <strong>Durée estimée:</strong> {{ annonce.duree_estimee_heures }}h
                  </p>
                </div>
              </div>
            </div>
            
            <div class="ml-4 text-right">
              <p v-if="annonce.budget_max" class="text-lg font-semibold text-gray-900">
                {{ annonce.budget_max }} €
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatRelativeDate(annonce.date_creation) }}
              </p>
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

    <!-- Modal de création -->
    <CreateAnnonceModal
      v-if="showCreateModal"
      @close="onCloseCreateModal"
      @created="onAnnonceCreated"
    />

    <!-- Modal de détails -->
    <AnnonceDetailsModal
      v-if="selectedAnnonce"
      :annonce="selectedAnnonce"
      @close="selectedAnnonce = null"
      @updated="onAnnonceUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import CreateAnnonceModal from '@/components/client/CreateAnnonceModal.vue'
import AnnonceDetailsModal from '@/components/client/AnnonceDetailsModal.vue'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { notifySuccess, notifyError } = useNotifications()

// État
const annonces = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const selectedAnnonce = ref(null)
const filters = ref({
  type_annonce: '',
  statut: '',
  urgence: ''
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
    type_annonce: '',
    statut: '',
    urgence: ''
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

const onCloseCreateModal = () => {
  showCreateModal.value = false
  
  // Si on vient de /nouvelle, rediriger vers la page principale
  if (router.currentRoute.value.name === 'ClientNouvelleAnnonce') {
    router.replace('/app/client/annonces')
  }
}

const onAnnonceCreated = (annonce) => {
  showCreateModal.value = false
  loadAnnonces()
  
  // Rediriger vers la page principale des annonces
  if (router.currentRoute.value.name === 'ClientNouvelleAnnonce') {
    router.replace('/app/client/annonces')
  }
  
  notifySuccess('Succès', 'Votre annonce a été créée avec succès')
}

const onAnnonceUpdated = (annonce) => {
  selectedAnnonce.value = null
  loadAnnonces()
  notifySuccess('Succès', 'Votre annonce a été mise à jour')
}

// Helpers
const getTypeClass = (type) => {
  return type === 'livraison' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-purple-100 text-purple-800'
}

const getStatutClass = (statut) => {
  const classes = {
    'ouverte': 'bg-green-100 text-green-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'terminee': 'bg-gray-100 text-gray-800',
    'annulee': 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatutLabel = (statut) => {
  const labels = {
    'ouverte': 'Ouverte',
    'en_cours': 'En cours',
    'terminee': 'Terminée',
    'annulee': 'Annulée'
  }
  return labels[statut] || statut
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatRelativeDate = (date) => {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Hier"
  if (days < 7) return `Il y a ${days} jours`
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
  return formatDate(date)
}

// Lifecycle
onMounted(() => {
  loadAnnonces()
  
  // Si on vient de la route /nouvelle, ouvrir le modal de création
  if (router.currentRoute.value.name === 'ClientNouvelleAnnonce') {
    showCreateModal.value = true
  }
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