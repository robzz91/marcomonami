<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes livraisons</h1>
        <p class="text-gray-600">Suivez et gérez toutes vos livraisons</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="refreshData"
          class="btn btn-secondary"
          :disabled="isLoading"
        >
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Actualiser
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="proposee">Proposée</option>
            <option value="acceptee">Acceptée</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div>
          <label class="label-field">Priorité</label>
          <select v-model="filters.priorite" class="input-field">
            <option value="">Toutes priorités</option>
            <option value="normale">Normale</option>
            <option value="urgente">Urgente</option>
            <option value="express">Express</option>
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
          <TruckIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total livraisons</p>
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
            <p class="text-sm font-medium text-gray-600">Livrées</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.livrees }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ChartBarIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Taux de réussite</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tauxReussite }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des livraisons -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Liste des livraisons</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des livraisons...</p>
      </div>

      <div v-else-if="filteredLivraisons.length === 0" class="p-8 text-center">
        <TruckIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune livraison trouvée</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Livraison
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destinataire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Heure
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="livraison in filteredLivraisons" :key="livraison.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    #{{ livraison.numero }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ livraison.colis_description }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ livraison.destinataire_nom }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ livraison.destinataire_telephone }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                  {{ livraison.adresse_livraison }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ livraison.ville }} {{ livraison.code_postal }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(livraison.date_livraison_prevue) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ livraison.creneau_horaire }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(livraison.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(livraison.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getPriorityClass(livraison.priorite)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getPriorityLabel(livraison.priorite) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewLivraison(livraison)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Voir
                </button>
                <button
                  v-if="livraison.statut === 'acceptee'"
                  @click="showDeliveryModal(livraison)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Terminer
                </button>
                <span
                  v-if="livraison.statut === 'proposee'"
                  class="text-gray-500 text-sm"
                >
                  En attente
                </span>
                <span
                  v-if="livraison.statut === 'terminee'"
                  class="text-green-600 text-sm"
                >
                  ✓ Terminée
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de confirmation de livraison -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Confirmer la livraison
          </h3>
          
          <form @submit.prevent="confirmDelivery" class="space-y-4">
            <div>
              <label class="label-field">Code de confirmation (optionnel)</label>
              <input
                v-model="deliveryConfirmation.code"
                type="text"
                class="input-field"
                placeholder="Code fourni par le destinataire"
              />
            </div>
            
            <div>
              <label class="label-field">Photo de preuve (optionnel)</label>
              <input
                @change="handleFileUpload"
                type="file"
                accept="image/*"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="label-field">Commentaires</label>
              <textarea
                v-model="deliveryConfirmation.commentaires"
                class="input-field"
                rows="3"
                placeholder="Commentaires sur la livraison..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showModal = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isConfirming"
                class="btn btn-primary"
              >
                <span v-if="isConfirming" class="spinner mr-2"></span>
                Confirmer la livraison
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
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const appStore = useAppStore()

// État
const isLoading = ref(true)
const isConfirming = ref(false)
const showModal = ref(false)
const livraisons = ref([])
const selectedLivraison = ref(null)

// Filtres
const filters = ref({
  statut: '',
  priorite: '',
  dateDebut: '',
  dateFin: ''
})

// Confirmation de livraison
const deliveryConfirmation = ref({
  code: '',
  photo: null,
  commentaires: ''
})

// Statistiques
const stats = ref({
  total: 0,
  enCours: 0,
  livrees: 0,
  tauxReussite: 0
})

// Computed
const filteredLivraisons = computed(() => {
  let filtered = livraisons.value

  if (filters.value.statut) {
    filtered = filtered.filter(l => l.statut === filters.value.statut)
  }

  if (filters.value.priorite) {
    filtered = filtered.filter(l => l.priorite === filters.value.priorite)
  }

  if (filters.value.dateDebut) {
    filtered = filtered.filter(l => l.date_livraison_prevue >= filters.value.dateDebut)
  }

  if (filters.value.dateFin) {
    filtered = filtered.filter(l => l.date_livraison_prevue <= filters.value.dateFin)
  }

  return filtered
})

// Méthodes
const loadLivraisons = async () => {
  try {
    isLoading.value = true
    
    const response = await fetch('/api/livraisons/mes-livraisons', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Adapter les données au format attendu par le template
      livraisons.value = data.livraisons.map(l => ({
        id: l.id,
        numero: `LIV-${l.id}`,
        colis_description: l.annonce_description,
        destinataire_nom: `${l.client_prenom || ''} ${l.client_nom || ''}`.trim() || 'Client',
        destinataire_telephone: l.client_telephone,
        adresse_livraison: l.adresse_arrivee,
        ville: '',
        code_postal: '',
        date_livraison_prevue: l.date_livraison_souhaitee,
        creneau_horaire: 'À définir',
        statut: l.livraison_statut,
        priorite: 'normale',
        annonce_titre: l.annonce_titre,
        budget: l.budget_max
      }))
      
      // Calcul des stats
      const total = livraisons.value.length
      const livrees = livraisons.value.filter(l => l.statut === 'terminee').length
      const enCours = livraisons.value.filter(l => l.statut === 'acceptee').length
      
      stats.value = {
        total,
        enCours,
        livrees,
        tauxReussite: total > 0 ? Math.round((livrees / total) * 100) : 0
      }
    } else {
      livraisons.value = []
      stats.value = { total: 0, enCours: 0, livrees: 0, tauxReussite: 0 }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des livraisons:', error)
    livraisons.value = []
    stats.value = { total: 0, enCours: 0, livrees: 0, tauxReussite: 0 }
    
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger les livraisons'
    })
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  loadLivraisons()
}

const viewLivraison = (livraison) => {
  router.push(`/app/annonces/${livraison.annonce_id}`)
}

const startLivraison = async (livraison) => {
  try {
    const response = await livreurService.startLivraison(livraison.id)
    
    if (response.success) {
      livraison.statut = 'en_cours'
      appStore.addNotification({
        type: 'success',
        title: 'Livraison démarrée',
        message: response.message || 'La livraison est maintenant en cours'
      })
    } else {
      appStore.addNotification({
        type: 'error',
        title: 'Erreur',
        message: response.message || 'Impossible de démarrer la livraison'
      })
    }
  } catch (error) {
    console.error('Erreur lors du démarrage de la livraison:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de démarrer la livraison'
    })
  }
}

const showDeliveryModal = (livraison) => {
  selectedLivraison.value = livraison
  showModal.value = true
}

const confirmDelivery = async () => {
  try {
    isConfirming.value = true
    
    const response = await fetch(`/api/livraisons/${selectedLivraison.value.id}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        commentaires: deliveryConfirmation.value.commentaires
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      selectedLivraison.value.statut = 'terminee'
      appStore.addNotification({
        type: 'success',
        title: 'Livraison confirmée',
        message: data.message || 'La livraison a été marquée comme terminée'
      })
      
      showModal.value = false
      deliveryConfirmation.value = { code: '', photo: null, commentaires: '' }
      
      // Recharger la liste
      loadLivraisons()
    } else {
      appStore.addNotification({
        type: 'error',
        title: 'Erreur',
        message: data.error || 'Impossible de confirmer la livraison'
      })
    }
  } catch (error) {
    console.error('Erreur lors de la confirmation de livraison:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de confirmer la livraison'
    })
  } finally {
    isConfirming.value = false
  }
}

const reportProblem = async (livraison) => {
  const probleme = prompt('Décrivez le problème rencontré:')
  if (!probleme) return

  try {
    const response = await livreurService.reportProblem(livraison.id, { description: probleme })
    
    if (response.success) {
      livraison.statut = 'echec'
      appStore.addNotification({
        type: 'warning',
        title: 'Problème signalé',
        message: response.message || 'Le problème a été signalé à l\'équipe support'
      })
    } else {
      appStore.addNotification({
        type: 'error',
        title: 'Erreur',
        message: response.message || 'Impossible de signaler le problème'
      })
    }
  } catch (error) {
    console.error('Erreur lors du signalement:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de signaler le problème'
    })
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    deliveryConfirmation.value.photo = file
  }
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    priorite: '',
    dateDebut: '',
    dateFin: ''
  }
}

const getStatusClass = (statut) => {
  const classes = {
    proposee: 'bg-yellow-100 text-yellow-800',
    acceptee: 'bg-blue-100 text-blue-800',
    terminee: 'bg-green-100 text-green-800',
    annulee: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    proposee: 'Proposée',
    acceptee: 'Acceptée',
    terminee: 'Terminée',
    annulee: 'Annulée'
  }
  return labels[statut] || statut
}

const getPriorityClass = (priorite) => {
  const classes = {
    normale: 'bg-gray-100 text-gray-800',
    urgente: 'bg-orange-100 text-orange-800',
    express: 'bg-red-100 text-red-800'
  }
  return classes[priorite] || 'bg-gray-100 text-gray-800'
}

const getPriorityLabel = (priorite) => {
  const labels = {
    normale: 'Normale',
    urgente: 'Urgente',
    express: 'Express'
  }
  return labels[priorite] || priorite
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadLivraisons()
})
</script>