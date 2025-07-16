<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="px-4 pt-5 pb-4 bg-white sm:p-6">
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ annonce.titre }}</h3>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                  Livraison
                </span>
                <span v-if="annonce.urgence === 'haute'" class="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                  Urgent
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                  {{ getStatutLabel(annonce.statut) }}
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

          <!-- Détails de livraison -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
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

            <!-- Informations client et budget -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Informations</h4>
              <dl class="space-y-2 text-sm">
                <div>
                  <dt class="font-medium text-gray-500">Client</dt>
                  <dd class="text-gray-900">{{ annonce.client_prenom }} {{ annonce.client_nom }}</dd>
                </div>
                <div v-if="annonce.budget_max">
                  <dt class="font-medium text-gray-500">Budget proposé</dt>
                  <dd class="text-gray-900 font-semibold text-green-600">{{ annonce.budget_max }} €</dd>
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

          <!-- Actions -->
          <div v-if="annonce.statut === 'ouverte'" class="flex justify-end space-x-3">
            <button
              @click="$emit('close')"
              class="btn btn-secondary"
            >
              Fermer
            </button>
            <button
              @click="acceptAnnonce"
              :disabled="loading"
              class="btn btn-primary"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ loading ? 'Acceptation...' : 'Accepter cette livraison' }}
            </button>
          </div>

          <div v-else class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">
              Cette annonce n'est plus disponible.
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

const emit = defineEmits(['close', 'accepted'])
const { notifySuccess, notifyError } = useNotifications()

// État
const loading = ref(false)

// Méthodes
const acceptAnnonce = async () => {
  loading.value = true
  try {
    // TODO: Implémenter l'acceptation de l'annonce
    // Cela nécessiterait probablement une API pour créer une livraison
    const response = await api.post(`/livraisons/accept-annonce/${props.annonce.id}`)
    
    if (response.data.success) {
      notifySuccess('Succès', 'Vous avez accepté cette livraison')
      emit('accepted', props.annonce)
    }
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error)
    notifyError('Erreur', 'Impossible d\'accepter cette livraison')
  } finally {
    loading.value = false
  }
}

// Helpers
const getStatutLabel = (statut) => {
  const labels = {
    'ouverte': 'Disponible',
    'en_cours': 'En cours',
    'terminee': 'Terminée',
    'annulee': 'Annulée'
  }
  return labels[statut] || statut
}

const formatUrgence = (urgence) => {
  const urgences = {
    'faible': 'Faible',
    'normale': 'Normale',
    'haute': 'Haute'
  }
  return urgences[urgence] || urgence
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