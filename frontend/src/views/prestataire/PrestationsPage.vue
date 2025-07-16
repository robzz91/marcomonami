<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes prestations</h1>
        <p class="text-gray-600">Gérez vos prestations et suivez vos clients</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        Nouvelle prestation
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="demandee">Demandée</option>
            <option value="acceptee">Acceptée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div>
          <label class="label-field">Client</label>
          <input
            type="text"
            v-model="filters.client"
            class="input-field"
            placeholder="Nom du client"
          />
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
          <BriefcaseIcon class="h-8 w-8 text-blue-600" />
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
            <p class="text-sm font-medium text-gray-600">Revenus du mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.revenus }}€</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des prestations -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Liste des prestations</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des prestations...</p>
      </div>

      <div v-else-if="filteredPrestations.length === 0" class="p-8 text-center">
        <BriefcaseIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune prestation trouvée</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prestation
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date prévue
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
                    {{ prestation.titre }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ prestation.description }}
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
                      {{ prestation.client_nom }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ prestation.client_email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(prestation.date_prevue) }}
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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewPrestation(prestation)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Voir
                </button>
                <button
                  v-if="prestation.statut === 'demandee'"
                  @click="acceptPrestation(prestation)"
                  class="text-green-600 hover:text-green-900"
                >
                  Accepter
                </button>
                <button
                  v-if="prestation.statut === 'demandee'"
                  @click="declinePrestation(prestation)"
                  class="text-red-600 hover:text-red-900"
                >
                  Refuser
                </button>
                <button
                  v-if="prestation.statut === 'acceptee'"
                  @click="startPrestation(prestation)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Démarrer
                </button>
                <button
                  v-if="prestation.statut === 'en_cours'"
                  @click="completePrestation(prestation)"
                  class="text-emerald-600 hover:text-emerald-900"
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
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Nouvelle prestation
          </h3>
          
          <form @submit.prevent="createPrestation" class="space-y-4">
            <div>
              <label class="label-field">Titre de la prestation</label>
              <input
                v-model="prestationForm.titre"
                type="text"
                class="input-field"
                placeholder="Titre de votre prestation"
                required
              />
            </div>
            
            <div>
              <label class="label-field">Description</label>
              <textarea
                v-model="prestationForm.description"
                class="input-field"
                rows="3"
                placeholder="Description détaillée de la prestation"
                required
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Catégorie</label>
                <select v-model="prestationForm.categorie" class="input-field" required>
                  <option value="">Sélectionner une catégorie</option>
                  <option value="menage">Ménage</option>
                  <option value="jardinage">Jardinage</option>
                  <option value="bricolage">Bricolage</option>
                  <option value="informatique">Informatique</option>
                  <option value="sante">Santé & Bien-être</option>
                </select>
              </div>
              <div>
                <label class="label-field">Prix (€)</label>
                <input
                  v-model="prestationForm.prix"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field"
                  placeholder="Prix de la prestation"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Durée estimée (heures)</label>
                <input
                  v-model="prestationForm.duree"
                  type="number"
                  step="0.5"
                  min="0.5"
                  class="input-field"
                  placeholder="2.5"
                  required
                />
              </div>
              <div>
                <label class="label-field">Zone d'intervention</label>
                <input
                  v-model="prestationForm.zone"
                  type="text"
                  class="input-field"
                  placeholder="Paris, Banlieue..."
                  required
                />
              </div>
            </div>
            
            <div>
              <label class="label-field">Matériel requis</label>
              <textarea
                v-model="prestationForm.materiel"
                class="input-field"
                rows="2"
                placeholder="Matériel nécessaire pour la prestation..."
              ></textarea>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <input
                  id="materiel_fourni"
                  v-model="prestationForm.materiel_fourni"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="materiel_fourni" class="ml-2 text-sm text-gray-900">
                  Matériel fourni par mes soins
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="deplacement_inclus"
                  v-model="prestationForm.deplacement_inclus"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="deplacement_inclus" class="ml-2 text-sm text-gray-900">
                  Déplacement inclus
                </label>
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
                Créer la prestation
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
import { prestataireService } from '@/services/prestataireService'
import { useNotifications } from '@/composables/useNotifications'
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isCreating = ref(false)
const showCreateModal = ref(false)
const prestations = ref([])

// Filtres
const filters = ref({
  statut: '',
  client: '',
  dateDebut: ''
})

// Formulaire de prestation
const prestationForm = ref({
  titre: '',
  description: '',
  categorie: '',
  prix: '',
  duree: '',
  zone: '',
  materiel: '',
  materiel_fourni: false,
  deplacement_inclus: false
})

// Statistiques
const stats = ref({
  total: 0,
  enCours: 0,
  terminees: 0,
  revenus: 0
})

// Computed
const filteredPrestations = computed(() => {
  let filtered = prestations.value

  if (filters.value.statut) {
    filtered = filtered.filter(p => p.statut === filters.value.statut)
  }

  if (filters.value.client) {
    const client = filters.value.client.toLowerCase()
    filtered = filtered.filter(p => 
      p.client_nom.toLowerCase().includes(client)
    )
  }

  if (filters.value.dateDebut) {
    filtered = filtered.filter(p => p.date_prevue >= filters.value.dateDebut)
  }

  return filtered
})

// Méthodes
const loadPrestations = async () => {
  try {
    isLoading.value = true
    
    const response = await prestataireService.getPrestations(filters.value)
    prestations.value = response.prestations || []
    
    // Calcul des stats
    stats.value = {
      total: prestations.value.length,
      enCours: prestations.value.filter(p => ['acceptee', 'en_cours'].includes(p.statut)).length,
      terminees: prestations.value.filter(p => p.statut === 'terminee').length,
      revenus: prestations.value
        .filter(p => p.statut === 'terminee')
        .reduce((sum, p) => sum + p.prix, 0)
    }
  } catch (error) {
    handleApiError(error, 'Impossible de charger les prestations')
  } finally {
    isLoading.value = false
  }
}

const createPrestation = async () => {
  try {
    isCreating.value = true
    
    await prestataireService.createPrestation(prestationForm.value)
    
    notifySuccess('Prestation créée', 'Votre nouvelle prestation a été créée')
    
    showCreateModal.value = false
    prestationForm.value = {
      titre: '',
      description: '',
      categorie: '',
      prix: '',
      duree: '',
      zone: '',
      materiel: '',
      materiel_fourni: false,
      deplacement_inclus: false
    }
    loadPrestations()
  } catch (error) {
    handleApiError(error, 'Impossible de créer la prestation')
  } finally {
    isCreating.value = false
  }
}

const viewPrestation = (prestation) => {
  router.push(`/app/prestataire/prestations/${prestation.id}`)
}

const acceptPrestation = async (prestation) => {
  try {
    await prestataireService.acceptPrestation(prestation.id)
    
    prestation.statut = 'acceptee'
    notifySuccess('Prestation acceptée', 'Vous avez accepté cette prestation')
  } catch (error) {
    handleApiError(error, 'Impossible d\'accepter la prestation')
  }
}

const declinePrestation = async (prestation) => {
  const raison = prompt('Raison du refus (optionnel):')
  
  try {
    await prestataireService.declinePrestation(prestation.id, raison)
    
    prestation.statut = 'annulee'
    notifySuccess('Prestation refusée', 'Vous avez refusé cette prestation')
  } catch (error) {
    handleApiError(error, 'Impossible de refuser la prestation')
  }
}

const startPrestation = async (prestation) => {
  try {
    await prestataireService.startPrestation(prestation.id)
    
    prestation.statut = 'en_cours'
    notifySuccess('Prestation démarrée', 'La prestation est maintenant en cours')
  } catch (error) {
    handleApiError(error, 'Impossible de démarrer la prestation')
  }
}

const completePrestation = async (prestation) => {
  try {
    await prestataireService.completePrestation(prestation.id, {})
    
    prestation.statut = 'terminee'
    notifySuccess('Prestation terminée', 'Excellent travail ! La prestation est terminée')
  } catch (error) {
    handleApiError(error, 'Impossible de terminer la prestation')
  }
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    client: '',
    dateDebut: ''
  }
}

const getStatusClass = (statut) => {
  const classes = {
    demandee: 'bg-yellow-100 text-yellow-800',
    acceptee: 'bg-blue-100 text-blue-800',
    en_cours: 'bg-purple-100 text-purple-800',
    terminee: 'bg-green-100 text-green-800',
    annulee: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    demandee: 'Demandée',
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