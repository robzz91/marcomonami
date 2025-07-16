<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes prestations</h1>
        <p class="text-gray-600">Suivez l'état de vos demandes de services</p>
      </div>
      <router-link to="/app/client/services" class="btn btn-primary">
        Rechercher un service
      </router-link>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="acceptee">Acceptée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div>
          <label class="label-field">Catégorie</label>
          <select v-model="filters.categorie" class="input-field">
            <option value="">Toutes les catégories</option>
            <option value="livraison">Livraison</option>
            <option value="menage">Ménage</option>
            <option value="jardinage">Jardinage</option>
            <option value="bricolage">Bricolage</option>
            <option value="informatique">Informatique</option>
            <option value="sante">Santé</option>
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
          <CalendarDaysIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total prestations</p>
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
            <p class="text-sm font-medium text-gray-600">Terminées</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.terminees }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CurrencyEuroIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Dépenses totales</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.depensesTotales }}€</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des prestations -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Historique des prestations</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des prestations...</p>
      </div>

      <div v-else-if="filteredPrestations.length === 0" class="p-8 text-center">
        <CalendarDaysIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune prestation trouvée</p>
        <router-link to="/app/client/services" class="mt-4 btn btn-primary">
          Rechercher un service
        </router-link>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prestataire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date demandée
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="prestation in filteredPrestations" :key="prestation.id">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ prestation.service_titre }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ prestation.categorie }} • {{ prestation.date_demande }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon class="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ prestation.prestataire_nom }}
                    </div>
                    <div class="text-sm text-gray-500">
                      <div class="flex items-center">
                        <StarIcon
                          v-for="i in 5"
                          :key="i"
                          :class="i <= prestation.prestataire_note ? 'text-yellow-400' : 'text-gray-300'"
                          class="h-3 w-3 fill-current"
                        />
                        <span class="ml-1">({{ prestation.prestataire_note }})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(prestation.date_souhaitee) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ prestation.creneau }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ prestation.prix }}€
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(prestation.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(prestation.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                <div class="flex space-x-2">
                  <button
                    @click="viewPrestation(prestation)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Voir
                  </button>
                  <button
                    v-if="prestation.statut === 'en_attente'"
                    @click="cancelPrestation(prestation)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Annuler
                  </button>
                  <button
                    v-if="prestation.statut === 'terminee' && !prestation.avis_donne"
                    @click="showReviewModal(prestation)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Noter
                  </button>
                  <button
                    v-if="prestation.statut === 'terminee'"
                    @click="rebookService(prestation)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Réserver à nouveau
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal d'évaluation -->
    <div
      v-if="showReviewModalFlag"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showReviewModalFlag = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Évaluer la prestation
          </h3>
          
          <div v-if="selectedPrestation" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900">{{ selectedPrestation.service_titre }}</h4>
              <p class="text-sm text-gray-600">{{ selectedPrestation.prestataire_nom }}</p>
            </div>
            
            <form @submit.prevent="submitReview" class="space-y-4">
              <div>
                <label class="label-field">Note (sur 5)</label>
                <div class="flex space-x-2">
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    @click="reviewForm.note = i"
                    class="focus:outline-none"
                  >
                    <StarIcon
                      :class="i <= reviewForm.note ? 'text-yellow-400' : 'text-gray-300'"
                      class="h-8 w-8 fill-current hover:text-yellow-400 transition-colors"
                    />
                  </button>
                </div>
              </div>
              
              <div>
                <label class="label-field">Commentaire</label>
                <textarea
                  v-model="reviewForm.commentaire"
                  class="input-field"
                  rows="4"
                  placeholder="Partagez votre expérience..."
                  required
                ></textarea>
              </div>
              
              <div class="flex items-center">
                <input
                  id="recommande"
                  v-model="reviewForm.recommande"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="recommande" class="ml-2 text-sm text-gray-900">
                  Je recommande ce prestataire
                </label>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="showReviewModalFlag = false"
                  class="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isSubmittingReview"
                  class="btn btn-primary"
                >
                  <span v-if="isSubmittingReview" class="spinner mr-2"></span>
                  Publier l'avis
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clientService } from '@/services/clientService'
import { useNotifications } from '@/composables/useNotifications'
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  UserIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { notifySuccess, notifyError, notifyWarning, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isSubmittingReview = ref(false)
const showReviewModalFlag = ref(false)
const prestations = ref([])
const selectedPrestation = ref(null)

// Filtres
const filters = ref({
  statut: '',
  categorie: '',
  dateDebut: ''
})

// Formulaire d'évaluation
const reviewForm = ref({
  note: 0,
  commentaire: '',
  recommande: false
})

// Statistiques
const stats = ref({
  total: 0,
  enCours: 0,
  terminees: 0,
  depensesTotales: 0
})

// Computed
const filteredPrestations = computed(() => {
  let filtered = prestations.value

  if (filters.value.statut) {
    filtered = filtered.filter(p => p.statut === filters.value.statut)
  }

  if (filters.value.categorie) {
    filtered = filtered.filter(p => p.categorie === filters.value.categorie)
  }

  if (filters.value.dateDebut) {
    filtered = filtered.filter(p => p.date_souhaitee >= filters.value.dateDebut)
  }

  return filtered
})

// Méthodes
const loadPrestations = async () => {
  try {
    isLoading.value = true
    
    const prestationFilters = {
      statut: filters.value.statut,
      categorie: filters.value.categorie,
      date_debut: filters.value.dateDebut
    }
    
    const response = await clientService.getPrestations(prestationFilters)
    prestations.value = response.prestations || []

    // Calcul des stats
    stats.value = {
      total: prestations.value.length,
      enCours: prestations.value.filter(p => ['en_attente', 'acceptee', 'en_cours'].includes(p.statut)).length,
      terminees: prestations.value.filter(p => p.statut === 'terminee').length,
      depensesTotales: prestations.value
        .filter(p => p.statut === 'terminee')
        .reduce((sum, p) => sum + p.prix, 0)
    }
  } catch (error) {
    handleApiError(error, 'Impossible de charger les prestations')
    prestations.value = []
    stats.value = { total: 0, enCours: 0, terminees: 0, depensesTotales: 0 }
  } finally {
    isLoading.value = false
  }
}

const viewPrestation = (prestation) => {
  router.push(`/app/client/prestations/${prestation.id}`)
}

const cancelPrestation = async (prestation) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette prestation ?')) return

  try {
    const reason = prompt('Motif d\'annulation (optionnel):')
    await clientService.cancelPrestation(prestation.id, reason)
    
    prestation.statut = 'annulee'
    notifySuccess('Prestation annulée', 'Votre prestation a été annulée')
  } catch (error) {
    handleApiError(error, 'Impossible d\'annuler la prestation')
  }
}

const showReviewModal = (prestation) => {
  selectedPrestation.value = prestation
  showReviewModalFlag.value = true
  reviewForm.value = { note: 0, commentaire: '', recommande: false }
}

const submitReview = async () => {
  if (reviewForm.value.note === 0) {
    notifyWarning('Note requise', 'Veuillez attribuer une note')
    return
  }

  try {
    isSubmittingReview.value = true
    
    const reviewData = {
      note: reviewForm.value.note,
      commentaire: reviewForm.value.commentaire,
      recommande: reviewForm.value.recommande
    }
    
    await clientService.submitReview(selectedPrestation.value.id, reviewData)
    
    selectedPrestation.value.avis_donne = true
    showReviewModalFlag.value = false
    
    notifySuccess('Avis publié', 'Merci pour votre évaluation !')
  } catch (error) {
    handleApiError(error, 'Impossible de publier l\'avis')
  } finally {
    isSubmittingReview.value = false
  }
}

const rebookService = (prestation) => {
  // Rediriger vers la page de réservation du service
  router.push(`/app/client/services?search=${encodeURIComponent(prestation.service_titre)}`)
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    categorie: '',
    dateDebut: ''
  }
}

const getStatusClass = (statut) => {
  const classes = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    acceptee: 'bg-blue-100 text-blue-800',
    en_cours: 'bg-purple-100 text-purple-800',
    terminee: 'bg-green-100 text-green-800',
    annulee: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée'
  }
  return labels[statut] || statut
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadPrestations()
})
</script>