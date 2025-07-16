<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="px-4 pt-5 pb-4 bg-white sm:p-6">
          <!-- Header avec statut -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ annonce.titre }}</h3>
              <div class="flex items-center gap-2 mt-2">
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
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p class="text-gray-700 whitespace-pre-wrap">{{ annonce.description }}</p>
          </div>

          <!-- Détails spécifiques -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Livraison -->
            <div v-if="annonce.type_annonce === 'livraison'">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Détails de la livraison</h4>
              <dl class="space-y-2 text-sm">
                <div>
                  <dt class="font-medium text-gray-500">Départ</dt>
                  <dd class="text-gray-900">{{ annonce.adresse_depart }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-gray-500">Arrivée</dt>
                  <dd class="text-gray-900">{{ annonce.adresse_arrivee }}</dd>
                </div>
                <div v-if="annonce.date_livraison_souhaitee">
                  <dt class="font-medium text-gray-500">Date souhaitée</dt>
                  <dd class="text-gray-900">{{ formatDateTime(annonce.date_livraison_souhaitee) }}</dd>
                </div>
                <div v-if="annonce.poids_colis">
                  <dt class="font-medium text-gray-500">Poids</dt>
                  <dd class="text-gray-900">{{ annonce.poids_colis }} kg</dd>
                </div>
                <div v-if="annonce.dimensions_colis">
                  <dt class="font-medium text-gray-500">Dimensions</dt>
                  <dd class="text-gray-900">{{ annonce.dimensions_colis }}</dd>
                </div>
              </dl>
            </div>

            <!-- Prestation -->
            <div v-else>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Détails de la prestation</h4>
              <dl class="space-y-2 text-sm">
                <div>
                  <dt class="font-medium text-gray-500">Type de service</dt>
                  <dd class="text-gray-900">{{ formatTypePrestation(annonce.type_prestation) }}</dd>
                </div>
                <div v-if="annonce.date_prestation_souhaitee">
                  <dt class="font-medium text-gray-500">Date souhaitée</dt>
                  <dd class="text-gray-900">{{ formatDate(annonce.date_prestation_souhaitee) }}</dd>
                </div>
                <div v-if="annonce.duree_estimee_heures">
                  <dt class="font-medium text-gray-500">Durée estimée</dt>
                  <dd class="text-gray-900">{{ annonce.duree_estimee_heures }} heures</dd>
                </div>
              </dl>
            </div>

            <!-- Informations financières -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Informations</h4>
              <dl class="space-y-2 text-sm">
                <div v-if="annonce.budget_max">
                  <dt class="font-medium text-gray-500">Budget maximum</dt>
                  <dd class="text-gray-900 font-semibold">{{ annonce.budget_max }} €</dd>
                </div>
                <div>
                  <dt class="font-medium text-gray-500">Urgence</dt>
                  <dd class="text-gray-900">{{ formatUrgence(annonce.urgence) }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-gray-500">Créée le</dt>
                  <dd class="text-gray-900">{{ formatDateTime(annonce.date_creation) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Actions selon le statut -->
          <div v-if="annonce.statut === 'ouverte'" class="flex justify-end space-x-3">
            <button
              @click="updateStatut('annulee')"
              :disabled="loading"
              class="btn btn-secondary"
            >
              Annuler l'annonce
            </button>
            <button
              @click="showEditModal = true"
              class="btn btn-primary"
            >
              Modifier
            </button>
          </div>

          <div v-else-if="annonce.statut === 'en_cours'" class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm text-yellow-800">
              Cette annonce est en cours de traitement. Vous pourrez la marquer comme terminée une fois le service effectué.
            </p>
            <button
              @click="updateStatut('terminee')"
              :disabled="loading"
              class="mt-3 btn btn-primary"
            >
              Marquer comme terminée
            </button>
          </div>

          <div v-else class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">
              Cette annonce est {{ annonce.statut === 'terminee' ? 'terminée' : 'annulée' }}.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  annonce: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])
const { notifySuccess, notifyError } = useNotifications()

// État
const loading = ref(false)
const showEditModal = ref(false)

// Méthodes
const updateStatut = async (newStatut) => {
  loading.value = true
  try {
    const response = await api.patch(`/annonces/${props.annonce.id}/status`, {
      statut: newStatut
    })
    
    if (response.data.success || response.data.statut) {
      notifySuccess('Succès', 'Le statut a été mis à jour')
      emit('updated', { ...props.annonce, statut: newStatut })
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    notifyError('Erreur', 'Impossible de mettre à jour le statut')
  } finally {
    loading.value = false
  }
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

const formatTypePrestation = (type) => {
  const types = {
    'menage': 'Ménage',
    'jardinage': 'Jardinage',
    'bricolage': 'Bricolage',
    'demenagement': 'Déménagement',
    'informatique': 'Informatique',
    'cours': 'Cours particuliers',
    'autre': 'Autre'
  }
  return types[type] || type
}

const formatUrgence = (urgence) => {
  const urgences = {
    'faible': 'Faible',
    'normale': 'Normale',
    'haute': 'Haute'
  }
  return urgences[urgence] || urgence
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>