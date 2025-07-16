<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des contrats</h1>
        <p class="text-gray-600">Gérez vos contrats clients et partenariats</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        Nouveau contrat
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="en_attente">En attente</option>
            <option value="actif">Actif</option>
            <option value="expire">Expiré</option>
            <option value="resilie">Résilié</option>
          </select>
        </div>
        <div>
          <label class="label-field">Type</label>
          <select v-model="filters.type" class="input-field">
            <option value="">Tous les types</option>
            <option value="client">Client</option>
            <option value="fournisseur">Fournisseur</option>
            <option value="livraison">Livraison</option>
            <option value="partenariat">Partenariat</option>
          </select>
        </div>
        <div>
          <label class="label-field">Client/Partenaire</label>
          <input
            type="text"
            v-model="filters.recherche"
            class="input-field"
            placeholder="Rechercher..."
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
          <DocumentTextIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total contrats</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Actifs</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.actifs }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ClockIcon class="h-8 w-8 text-yellow-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En attente</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.enAttente }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CurrencyEuroIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valeur totale</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.valeurTotale }}€</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des contrats -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Liste des contrats</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des contrats...</p>
      </div>

      <div v-else-if="filteredContrats.length === 0" class="p-8 text-center">
        <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucun contrat trouvé</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contrat
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client/Partenaire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
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
            <tr v-for="contrat in filteredContrats" :key="contrat.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ contrat.numero }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ contrat.objet }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ contrat.client_nom }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ contrat.client_email }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getTypeClass(contrat.type)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getTypeLabel(contrat.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(contrat.date_debut) }}
                </div>
                <div class="text-sm text-gray-500">
                  au {{ formatDate(contrat.date_fin) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ contrat.valeur }}€
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(contrat.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(contrat.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewContrat(contrat)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Voir
                </button>
                <button
                  v-if="contrat.statut === 'brouillon'"
                  @click="editContrat(contrat)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Modifier
                </button>
                <button
                  v-if="contrat.statut === 'en_attente'"
                  @click="activateContrat(contrat)"
                  class="text-green-600 hover:text-green-900"
                >
                  Activer
                </button>
                <button
                  v-if="['actif', 'en_attente'].includes(contrat.statut)"
                  @click="cancelContrat(contrat)"
                  class="text-red-600 hover:text-red-900"
                >
                  Résilier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de création/modification -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeModals"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Nouveau contrat' : 'Modifier le contrat' }}
          </h3>
          
          <form @submit.prevent="saveContrat" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Numéro de contrat</label>
                <input
                  v-model="contratForm.numero"
                  type="text"
                  class="input-field"
                  placeholder="CNT-2024-001"
                  required
                />
              </div>
              <div>
                <label class="label-field">Type</label>
                <select v-model="contratForm.type" class="input-field" required>
                  <option value="">Sélectionner un type</option>
                  <option value="client">Client</option>
                  <option value="fournisseur">Fournisseur</option>
                  <option value="livraison">Livraison</option>
                  <option value="partenariat">Partenariat</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="label-field">Objet du contrat</label>
              <input
                v-model="contratForm.objet"
                type="text"
                class="input-field"
                placeholder="Fourniture de produits alimentaires bio"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Nom du client/partenaire</label>
                <input
                  v-model="contratForm.client_nom"
                  type="text"
                  class="input-field"
                  placeholder="Entreprise ABC"
                  required
                />
              </div>
              <div>
                <label class="label-field">Email</label>
                <input
                  v-model="contratForm.client_email"
                  type="email"
                  class="input-field"
                  placeholder="contact@entreprise.com"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="label-field">Date de début</label>
                <input
                  v-model="contratForm.date_debut"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label class="label-field">Date de fin</label>
                <input
                  v-model="contratForm.date_fin"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label class="label-field">Valeur (€)</label>
                <input
                  v-model="contratForm.valeur"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field"
                  placeholder="1000.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label class="label-field">Description</label>
              <textarea
                v-model="contratForm.description"
                class="input-field"
                rows="4"
                placeholder="Description détaillée du contrat..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModals"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="btn btn-primary"
              >
                <span v-if="isSaving" class="spinner mr-2"></span>
                {{ showCreateModal ? 'Créer' : 'Modifier' }}
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
import { commercantService } from '@/services/commercantService'
import { useNotifications } from '@/composables/useNotifications'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const appStore = useAppStore()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isSaving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const contrats = ref([])
const selectedContrat = ref(null)

// Filtres
const filters = ref({
  statut: '',
  type: '',
  recherche: ''
})

// Formulaire de contrat
const contratForm = ref({
  numero: '',
  type: '',
  objet: '',
  client_nom: '',
  client_email: '',
  date_debut: '',
  date_fin: '',
  valeur: '',
  description: ''
})

// Statistiques
const stats = ref({
  total: 0,
  actifs: 0,
  enAttente: 0,
  valeurTotale: 0
})

// Computed
const filteredContrats = computed(() => {
  let filtered = contrats.value

  if (filters.value.statut) {
    filtered = filtered.filter(c => c.statut === filters.value.statut)
  }

  if (filters.value.type) {
    filtered = filtered.filter(c => c.type === filters.value.type)
  }

  if (filters.value.recherche) {
    const recherche = filters.value.recherche.toLowerCase()
    filtered = filtered.filter(c => 
      c.client_nom.toLowerCase().includes(recherche) ||
      c.objet.toLowerCase().includes(recherche) ||
      c.numero.toLowerCase().includes(recherche)
    )
  }

  return filtered
})

// Méthodes
const loadContrats = async () => {
  try {
    isLoading.value = true
    
    const response = await commercantService.getContrats(filters.value)
    
    if (response.success) {
      contrats.value = response.data || []
      
      // Calcul des stats
      const total = contrats.value.length
      stats.value = {
        total,
        actifs: contrats.value.filter(c => c.statut === 'actif').length,
        enAttente: contrats.value.filter(c => c.statut === 'en_attente').length,
        valeurTotale: contrats.value.reduce((sum, c) => sum + (c.valeur || 0), 0)
      }
    } else {
      contrats.value = []
      stats.value = { total: 0, actifs: 0, enAttente: 0, valeurTotale: 0 }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des contrats:', error)
    contrats.value = []
    stats.value = { total: 0, actifs: 0, enAttente: 0, valeurTotale: 0 }
    handleApiError(error, 'Impossible de charger les contrats')
  } finally {
    isLoading.value = false
  }
}

const saveContrat = async () => {
  try {
    isSaving.value = true
    
    let response
    if (showCreateModal.value) {
      response = await commercantService.createContrat(contratForm.value)
    } else {
      response = await commercantService.updateContrat(selectedContrat.value.id, contratForm.value)
    }
    
    if (response.success) {
      if (showCreateModal.value) {
        notifySuccess('Contrat créé', response.message || 'Le nouveau contrat a été créé avec succès')
      } else {
        notifySuccess('Contrat modifié', response.message || 'Le contrat a été mis à jour avec succès')
      }
      
      closeModals()
      loadContrats()
    } else {
      notifyError('Erreur', response.message || 'Impossible de sauvegarder le contrat')
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du contrat:', error)
    handleApiError(error, 'Impossible de sauvegarder le contrat')
  } finally {
    isSaving.value = false
  }
}

const viewContrat = (contrat) => {
  router.push(`/app/commercant/contrats/${contrat.id}`)
}

const editContrat = (contrat) => {
  selectedContrat.value = contrat
  contratForm.value = { ...contrat }
  showEditModal.value = true
}

const activateContrat = async (contrat) => {
  try {
    const response = await commercantService.activateContrat(contrat.id)
    
    if (response.success) {
      contrat.statut = 'actif'
      notifySuccess('Contrat activé', response.message || 'Le contrat est maintenant actif')
    } else {
      notifyError('Erreur', response.message || 'Impossible d\'activer le contrat')
    }
  } catch (error) {
    console.error('Erreur lors de l\'activation du contrat:', error)
    handleApiError(error, 'Impossible d\'activer le contrat')
  }
}

const cancelContrat = async (contrat) => {
  if (!confirm('Êtes-vous sûr de vouloir résilier ce contrat ?')) return

  try {
    const response = await commercantService.cancelContrat(contrat.id)
    
    if (response.success) {
      contrat.statut = 'resilie'
      notifySuccess('Contrat résilié', response.message || 'Le contrat a été résilié')
    } else {
      notifyError('Erreur', response.message || 'Impossible de résilier le contrat')
    }
  } catch (error) {
    console.error('Erreur lors de la résiliation du contrat:', error)
    handleApiError(error, 'Impossible de résilier le contrat')
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedContrat.value = null
  contratForm.value = {
    numero: '',
    type: '',
    objet: '',
    client_nom: '',
    client_email: '',
    date_debut: '',
    date_fin: '',
    valeur: '',
    description: ''
  }
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    type: '',
    recherche: ''
  }
}

const getStatusClass = (statut) => {
  const classes = {
    brouillon: 'bg-gray-100 text-gray-800',
    en_attente: 'bg-yellow-100 text-yellow-800',
    actif: 'bg-green-100 text-green-800',
    expire: 'bg-orange-100 text-orange-800',
    resilie: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    brouillon: 'Brouillon',
    en_attente: 'En attente',
    actif: 'Actif',
    expire: 'Expiré',
    resilie: 'Résilié'
  }
  return labels[statut] || statut
}

const getTypeClass = (type) => {
  const classes = {
    client: 'bg-blue-100 text-blue-800',
    fournisseur: 'bg-purple-100 text-purple-800',
    livraison: 'bg-emerald-100 text-emerald-800',
    partenariat: 'bg-indigo-100 text-indigo-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type) => {
  const labels = {
    client: 'Client',
    fournisseur: 'Fournisseur',
    livraison: 'Livraison',
    partenariat: 'Partenariat'
  }
  return labels[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadContrats()
})
</script>