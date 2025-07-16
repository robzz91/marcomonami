<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes livraisons</h1>
        <p class="text-gray-600">Gérez vos demandes de livraison et les propositions reçues</p>
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
        <router-link to="/app/annonces/new" class="btn btn-primary">
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouvelle annonce
        </router-link>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <TruckIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total annonces</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <UserGroupIcon class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Avec propositions</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.avecPropositions }}</p>
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
          <CheckCircleIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Terminées</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.terminees }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des livraisons -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Vos annonces de livraison</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des livraisons...</p>
      </div>

      <div v-else-if="livraisons.length === 0" class="p-8 text-center">
        <TruckIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune annonce de livraison trouvée</p>
        <router-link to="/app/annonces/new" class="mt-4 btn btn-primary">
          Créer une annonce de livraison
        </router-link>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div v-for="livraison in livraisons" :key="livraison.annonce_id" class="p-6">
          <!-- En-tête de l'annonce -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="text-lg font-medium text-gray-900">{{ livraison.titre }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ livraison.description }}</p>
              <div class="flex items-center mt-2 text-sm text-gray-500">
                <MapPinIcon class="h-4 w-4 mr-1" />
                {{ livraison.adresse_depart }} → {{ livraison.adresse_arrivee }}
              </div>
            </div>
            <div class="text-right">
              <span
                :class="getStatutClass(livraison.statut)"
                class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
              >
                {{ getStatutLabel(livraison.statut) }}
              </span>
              <p class="text-sm text-gray-500 mt-1">
                Créée le {{ formatDate(livraison.date_creation) }}
              </p>
            </div>
          </div>

          <!-- Détails de l'annonce -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div v-if="livraison.poids_colis">
              <p class="text-sm font-medium text-gray-600">Poids</p>
              <p class="text-sm text-gray-900">{{ livraison.poids_colis }} kg</p>
            </div>
            <div v-if="livraison.budget_max">
              <p class="text-sm font-medium text-gray-600">Budget max</p>
              <p class="text-sm text-gray-900">{{ livraison.budget_max }}€</p>
            </div>
            <div v-if="livraison.date_livraison_souhaitee">
              <p class="text-sm font-medium text-gray-600">Date souhaitée</p>
              <p class="text-sm text-gray-900">{{ formatDate(livraison.date_livraison_souhaitee) }}</p>
            </div>
          </div>

          <!-- Propositions -->
          <div v-if="livraison.nb_propositions > 0" class="mt-4">
            <div class="flex justify-between items-center mb-3">
              <h5 class="text-sm font-medium text-gray-900">
                Propositions reçues ({{ livraison.nb_propositions }})
              </h5>
              <button
                @click="togglePropositions(livraison.annonce_id)"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ openPropositions[livraison.annonce_id] ? 'Masquer' : 'Voir tout' }}
              </button>
            </div>

            <div v-show="openPropositions[livraison.annonce_id]" class="space-y-3">
              <div
                v-for="proposition in livraison.propositions"
                :key="proposition.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon class="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ proposition.livreur_nom }}</p>
                        <div class="flex items-center space-x-2">
                          <div class="flex items-center">
                            <StarIcon
                              v-for="i in 5"
                              :key="i"
                              :class="i <= proposition.livreur_note ? 'text-yellow-400' : 'text-gray-300'"
                              class="h-4 w-4 fill-current"
                            />
                            <span class="ml-1 text-sm text-gray-600">({{ proposition.livreur_note }})</span>
                          </div>
                          <span
                            :class="getPropositionStatutClass(proposition.statut)"
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded"
                          >
                            {{ getPropositionStatutLabel(proposition.statut) }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500">
                          Proposé le {{ formatDateTime(proposition.date_proposition) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="proposition.statut === 'proposee'" class="flex space-x-2 ml-4">
                    <button
                      @click="refuseProposition(proposition)"
                      class="btn btn-secondary btn-sm"
                      :disabled="isProcessing"
                    >
                      Refuser
                    </button>
                    <button
                      @click="acceptProposition(proposition)"
                      class="btn btn-primary btn-sm"
                      :disabled="isProcessing"
                    >
                      Accepter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si aucune proposition -->
          <div v-else-if="livraison.statut === 'ouverte'" class="mt-4 text-center py-4 bg-gray-50 rounded-lg">
            <UserGroupIcon class="h-8 w-8 text-gray-400 mx-auto" />
            <p class="mt-2 text-sm text-gray-600">Aucune proposition reçue pour le moment</p>
            <p class="text-xs text-gray-500">Les livreurs peuvent voir votre annonce et proposer leurs services</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de refus -->
    <div
      v-if="showRefusalModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showRefusalModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Refuser la proposition
          </h3>
          
          <form @submit.prevent="confirmRefusal" class="space-y-4">
            <div>
              <label class="label-field">Motif de refus (optionnel)</label>
              <textarea
                v-model="refusalForm.motif"
                class="input-field"
                rows="3"
                placeholder="Expliquez pourquoi vous refusez cette proposition..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showRefusalModal = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isProcessing"
                class="btn btn-primary"
              >
                <span v-if="isProcessing" class="spinner mr-2"></span>
                Confirmer le refus
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
import { useNotifications } from '@/composables/useNotifications'
import {
  TruckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  MapPinIcon,
  UserIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const appStore = useAppStore()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isProcessing = ref(false)
const showRefusalModal = ref(false)
const livraisons = ref([])
const openPropositions = ref({})
const selectedProposition = ref(null)

// Formulaire de refus
const refusalForm = ref({
  motif: ''
})

// Statistiques
const stats = computed(() => {
  const total = livraisons.value.length
  const avecPropositions = livraisons.value.filter(l => l.nb_propositions > 0).length
  const enCours = livraisons.value.filter(l => l.statut === 'en_cours').length
  const terminees = livraisons.value.filter(l => l.statut === 'terminee').length
  
  return {
    total,
    avecPropositions,
    enCours,
    terminees
  }
})

// Méthodes
const loadLivraisons = async () => {
  try {
    isLoading.value = true
    
    const response = await fetch('/api/clients/livraisons', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      livraisons.value = data.livraisons
      console.log('Livraisons chargées:', livraisons.value)
    } else {
      livraisons.value = []
      notifyError('Erreur', 'Impossible de charger les livraisons')
    }
  } catch (error) {
    console.error('Erreur lors du chargement des livraisons:', error)
    livraisons.value = []
    notifyError('Erreur', 'Impossible de charger les livraisons')
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  loadLivraisons()
}

const togglePropositions = (annonceId) => {
  openPropositions.value[annonceId] = !openPropositions.value[annonceId]
}

const acceptProposition = async (proposition) => {
  if (!confirm(`Êtes-vous sûr de vouloir accepter la proposition de ${proposition.livreur_nom} ?`)) {
    return
  }
  
  try {
    isProcessing.value = true
    
    const response = await fetch(`/api/clients/livraisons/${proposition.id}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      notifySuccess('Proposition acceptée', `La proposition de ${proposition.livreur_nom} a été acceptée`)
      loadLivraisons() // Recharger la liste
    } else {
      notifyError('Erreur', data.error || 'Impossible d\'accepter la proposition')
    }
  } catch (error) {
    console.error('Erreur acceptation proposition:', error)
    notifyError('Erreur', 'Impossible d\'accepter la proposition')
  } finally {
    isProcessing.value = false
  }
}

const refuseProposition = (proposition) => {
  selectedProposition.value = proposition
  showRefusalModal.value = true
}

const confirmRefusal = async () => {
  try {
    isProcessing.value = true
    
    const response = await fetch(`/api/clients/livraisons/${selectedProposition.value.id}/refuse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        motif: refusalForm.value.motif
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      notifySuccess('Proposition refusée', `La proposition de ${selectedProposition.value.livreur_nom} a été refusée`)
      showRefusalModal.value = false
      refusalForm.value.motif = ''
      loadLivraisons() // Recharger la liste
    } else {
      notifyError('Erreur', data.error || 'Impossible de refuser la proposition')
    }
  } catch (error) {
    console.error('Erreur refus proposition:', error)
    notifyError('Erreur', 'Impossible de refuser la proposition')
  } finally {
    isProcessing.value = false
  }
}

// Utilitaires
const getStatutClass = (statut) => {
  const classes = {
    'ouverte': 'bg-green-100 text-green-800',
    'en_cours': 'bg-blue-100 text-blue-800',
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

const getPropositionStatutClass = (statut) => {
  const classes = {
    'proposee': 'bg-yellow-100 text-yellow-800',
    'acceptee': 'bg-green-100 text-green-800',
    'refusee': 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getPropositionStatutLabel = (statut) => {
  const labels = {
    'proposee': 'En attente',
    'acceptee': 'Acceptée',
    'refusee': 'Refusée'
  }
  return labels[statut] || statut
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadLivraisons()
})
</script>