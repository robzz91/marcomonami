<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes trajets</h1>
        <p class="text-gray-600">Gérez vos trajets et itinéraires de livraison</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        Nouveau trajet
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="planifie">Planifié</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
        <div>
          <label class="label-field">Date de début</label>
          <input
            type="date"
            v-model="filters.dateDebut"
            class="input-field"
          />
        </div>
        <div>
          <label class="label-field">Date de fin</label>
          <input
            type="date"
            v-model="filters.dateFin"
            class="input-field"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="btn btn-secondary w-full"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <MapIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Trajets total</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ClockIcon class="h-8 w-8 text-yellow-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En cours</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.enCours }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Terminés</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.termines }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CurrencyEuroIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Revenus ce mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.revenus }}€</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des trajets -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Liste des trajets</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des trajets...</p>
      </div>

      <div v-else-if="filteredTrajets.length === 0" class="p-8 text-center">
        <MapIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucun trajet trouvé</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trajet
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Heure
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Livraisons
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenus
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="trajet in filteredTrajets" :key="trajet.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ trajet.depart }} → {{ trajet.arrivee }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ trajet.distance }}km • {{ trajet.duree_estimee }}min
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(trajet.date_debut) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatTime(trajet.heure_debut) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(trajet.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(trajet.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ trajet.nb_livraisons || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ trajet.revenus || 0 }}€
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewTrajet(trajet)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Voir
                </button>
                <button
                  v-if="trajet.statut === 'planifie'"
                  @click="startTrajet(trajet)"
                  class="text-green-600 hover:text-green-900"
                >
                  Démarrer
                </button>
                <button
                  v-if="trajet.statut === 'en_cours'"
                  @click="endTrajet(trajet)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Terminer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de création -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showCreateModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Nouveau trajet</h3>
          
          <form @submit.prevent="createTrajet" class="space-y-4">
            <div>
              <label class="label-field">Point de départ</label>
              <input
                v-model="newTrajet.depart"
                type="text"
                class="input-field"
                placeholder="Adresse de départ"
                required
              />
            </div>
            
            <div>
              <label class="label-field">Point d'arrivée</label>
              <input
                v-model="newTrajet.arrivee"
                type="text"
                class="input-field"
                placeholder="Adresse d'arrivée"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Date</label>
                <input
                  v-model="newTrajet.date"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label class="label-field">Heure</label>
                <input
                  v-model="newTrajet.heure"
                  type="time"
                  class="input-field"
                  required
                />
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showCreateModal = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                class="btn btn-primary"
              >
                <span v-if="isCreating" class="spinner mr-2"></span>
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { livreurService } from '@/services/livreurService'
import {
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyEuroIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const appStore = useAppStore()

// État
const isLoading = ref(true)
const isCreating = ref(false)
const showCreateModal = ref(false)
const trajets = ref([])

// Filtres
const filters = ref({
  statut: '',
  dateDebut: '',
  dateFin: ''
})

// Nouveau trajet
const newTrajet = ref({
  depart: '',
  arrivee: '',
  date: '',
  heure: ''
})

// Statistiques
const stats = ref({
  total: 0,
  enCours: 0,
  termines: 0,
  revenus: 0
})

// Computed
const filteredTrajets = computed(() => {
  let filtered = trajets.value

  if (filters.value.statut) {
    filtered = filtered.filter(t => t.statut === filters.value.statut)
  }

  if (filters.value.dateDebut) {
    filtered = filtered.filter(t => t.date_debut >= filters.value.dateDebut)
  }

  if (filters.value.dateFin) {
    filtered = filtered.filter(t => t.date_debut <= filters.value.dateFin)
  }

  return filtered
})

// Méthodes
const loadTrajets = async () => {
  try {
    isLoading.value = true
    
    const response = await livreurService.getTrajets(filters.value)
    
    if (response.success) {
      trajets.value = response.data || []
      
      // Calcul des stats
      stats.value = {
        total: trajets.value.length,
        enCours: trajets.value.filter(t => t.statut === 'en_cours').length,
        termines: trajets.value.filter(t => t.statut === 'termine').length,
        revenus: trajets.value.reduce((sum, t) => sum + (t.revenus || 0), 0)
      }
    } else {
      trajets.value = []
      stats.value = { total: 0, enCours: 0, termines: 0, revenus: 0 }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des trajets:', error)
    trajets.value = []
    stats.value = { total: 0, enCours: 0, termines: 0, revenus: 0 }
    
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger les trajets'
    })
  } finally {
    isLoading.value = false
  }
}

const createTrajet = async () => {
  try {
    isCreating.value = true
    
    const response = await livreurService.createTrajet(newTrajet.value)
    
    if (response.success) {
      appStore.addNotification({
        type: 'success',
        title: 'Trajet créé',
        message: response.message || 'Votre nouveau trajet a été planifié'
      })
      
      showCreateModal.value = false
      newTrajet.value = { depart: '', arrivee: '', date: '', heure: '' }
      loadTrajets()
    } else {
      appStore.addNotification({
        type: 'error',
        title: 'Erreur',
        message: response.message || 'Impossible de créer le trajet'
      })
    }
  } catch (error) {
    console.error('Erreur lors de la création du trajet:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de créer le trajet'
    })
  } finally {
    isCreating.value = false
  }
}

const viewTrajet = (trajet) => {
  router.push(`/app/livreur/trajets/${trajet.id}`)
}

const startTrajet = async (trajet) => {
  try {
    const response = await livreurService.startTrajet(trajet.id)
    
    if (response.success) {
      trajet.statut = 'en_cours'
      appStore.addNotification({
        type: 'success',
        title: 'Trajet démarré',
        message: response.message || 'Bon voyage !'
      })
    } else {
      appStore.addNotification({
        type: 'error',
        title: 'Erreur',
        message: response.message || 'Impossible de démarrer le trajet'
      })
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du trajet:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de démarrer le trajet'
    })
  }
}

const endTrajet = async (trajet) => {
  try {
    const response = await livreurService.endTrajet(trajet.id)
    
    if (response.success) {
      trajet.statut = 'termine'
      appStore.addNotification({
        type: 'success',
        title: 'Trajet terminé',
        message: response.message || 'Excellent travail !'
      })
    } else {
      appStore.addNotification({
        type: 'error',
        title: 'Erreur',
        message: response.message || 'Impossible de terminer le trajet'
      })
    }
  } catch (error) {
    console.error('Erreur lors de la fin du trajet:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de terminer le trajet'
    })
  }
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    dateDebut: '',
    dateFin: ''
  }
}

const getStatusClass = (statut) => {
  const classes = {
    planifie: 'bg-yellow-100 text-yellow-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800',
    annule: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    planifie: 'Planifié',
    en_cours: 'En cours',
    termine: 'Terminé',
    annule: 'Annulé'
  }
  return labels[statut] || statut
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatTime = (time) => {
  return time
}

// Lifecycle
onMounted(() => {
  loadTrajets()
})
</script>