<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
              Créer une nouvelle annonce
            </h3>

            <!-- Type d'annonce -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type d'annonce <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  @click="formData.type_annonce = 'livraison'"
                  :class="[
                    'p-4 border-2 rounded-lg text-center transition-all',
                    formData.type_annonce === 'livraison'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p class="font-medium">Livraison</p>
                  <p class="text-sm text-gray-600">Pour expédier un colis</p>
                </button>
                
                <button
                  type="button"
                  @click="formData.type_annonce = 'prestation'"
                  :class="[
                    'p-4 border-2 rounded-lg text-center transition-all',
                    formData.type_annonce === 'prestation'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A10.002 10.002 0 0112 23c-5.523 0-10-4.477-10-10S6.477 3 12 3a10.002 10.002 0 019 5.745M22 4v6h-6" />
                  </svg>
                  <p class="font-medium">Prestation</p>
                  <p class="text-sm text-gray-600">Pour demander un service</p>
                </button>
              </div>
            </div>

            <!-- Erreurs de validation -->
            <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4">
              <div class="flex">
                <svg class="flex-shrink-0 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Erreurs de validation</h3>
                  <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                    <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Informations générales -->
            <div class="space-y-4">
              <div>
                <label class="label-field">Titre <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.titre"
                  type="text"
                  class="input-field"
                  placeholder="Ex: Livraison urgente de documents"
                  required
                  minlength="3"
                  maxlength="100"
                >
              </div>

              <div>
                <label class="label-field">Description <span class="text-red-500">*</span></label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  class="input-field"
                  placeholder="Décrivez votre besoin en détail..."
                  required
                  minlength="10"
                  maxlength="1000"
                ></textarea>
              </div>

              <!-- Champs spécifiques livraison -->
              <div v-if="formData.type_annonce === 'livraison'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label-field">Adresse de départ <span class="text-red-500">*</span></label>
                    <input
                      v-model="formData.adresse_depart"
                      type="text"
                      class="input-field"
                      placeholder="Ex: 10 rue de la Paix, Paris"
                      required
                    >
                  </div>
                  <div>
                    <label class="label-field">Adresse d'arrivée <span class="text-red-500">*</span></label>
                    <input
                      v-model="formData.adresse_arrivee"
                      type="text"
                      class="input-field"
                      placeholder="Ex: 25 avenue des Champs, Lyon"
                      required
                    >
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="label-field">Date souhaitée</label>
                    <input
                      v-model="formData.date_livraison_souhaitee"
                      type="datetime-local"
                      class="input-field"
                      :min="minDate"
                    >
                  </div>
                  <div>
                    <label class="label-field">Poids (kg)</label>
                    <input
                      v-model.number="formData.poids_colis"
                      type="number"
                      step="0.1"
                      min="0"
                      max="200"
                      class="input-field"
                      placeholder="Ex: 2.5"
                    >
                  </div>
                  <div>
                    <label class="label-field">Dimensions</label>
                    <input
                      v-model="formData.dimensions_colis"
                      type="text"
                      class="input-field"
                      placeholder="Ex: 30x20x10 cm"
                    >
                  </div>
                </div>
              </div>

              <!-- Champs spécifiques prestation -->
              <div v-else-if="formData.type_annonce === 'prestation'" class="space-y-4">
                <div>
                  <label class="label-field">Type de prestation <span class="text-red-500">*</span></label>
                  <select v-model="formData.type_prestation" class="input-field" required>
                    <option value="">Sélectionnez un type</option>
                    <option value="menage">Ménage</option>
                    <option value="jardinage">Jardinage</option>
                    <option value="bricolage">Bricolage</option>
                    <option value="demenagement">Déménagement</option>
                    <option value="informatique">Informatique</option>
                    <option value="cours">Cours particuliers</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label-field">Date souhaitée</label>
                    <input
                      v-model="formData.date_prestation_souhaitee"
                      type="date"
                      class="input-field"
                      :min="minDate.slice(0, 10)"
                    >
                  </div>
                  <div>
                    <label class="label-field">Durée estimée (heures)</label>
                    <input
                      v-model.number="formData.duree_estimee_heures"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="24"
                      class="input-field"
                      placeholder="Ex: 3"
                    >
                  </div>
                </div>
              </div>

              <!-- Champs communs -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label-field">Budget maximum (€)</label>
                  <input
                    v-model.number="formData.budget_max"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10000"
                    class="input-field"
                    placeholder="Ex: 50"
                  >
                </div>
                <div>
                  <label class="label-field">Urgence</label>
                  <select v-model="formData.urgence" class="input-field">
                    <option value="faible">Faible</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ loading ? 'Création...' : 'Créer l\'annonce' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

const emit = defineEmits(['close', 'created'])
const { notifySuccess, notifyError } = useNotifications()

// État
const loading = ref(false)
const formData = ref({
  type_annonce: 'livraison',
  titre: '',
  description: '',
  // Livraison
  adresse_depart: '',
  adresse_arrivee: '',
  date_livraison_souhaitee: '',
  poids_colis: null,
  dimensions_colis: '',
  // Prestation
  type_prestation: '',
  date_prestation_souhaitee: '',
  duree_estimee_heures: null,
  // Commun
  budget_max: null,
  urgence: 'normale'
})

// Computed
const minDate = computed(() => {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
  if (!formData.value.titre || !formData.value.description || !formData.value.type_annonce) {
    return false
  }
  
  // Le formulaire est invalide s'il y a des erreurs de validation
  if (validationErrors.value.length > 0) {
    return false
  }
  
  if (formData.value.type_annonce === 'livraison') {
    return formData.value.adresse_depart && formData.value.adresse_arrivee
  } else {
    return formData.value.type_prestation
  }
})

const validationErrors = computed(() => {
  const errors = []
  
  // Validation du titre
  if (formData.value.titre && formData.value.titre.length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères')
  }
  if (formData.value.titre && formData.value.titre.length > 100) {
    errors.push('Le titre ne peut pas dépasser 100 caractères')
  }
  
  // Validation de la description
  if (formData.value.description && formData.value.description.length < 10) {
    errors.push('La description doit contenir au moins 10 caractères')
  }
  
  // Validation du budget
  if (formData.value.budget_max) {
    if (formData.value.budget_max < 0) {
      errors.push('Le budget ne peut pas être négatif')
    }
    if (formData.value.budget_max > 10000) {
      errors.push('Le budget ne peut pas dépasser 10 000 €')
    }
  }
  
  // Validation du poids
  if (formData.value.poids_colis) {
    if (formData.value.poids_colis < 0) {
      errors.push('Le poids ne peut pas être négatif')
    }
    if (formData.value.poids_colis > 200) {
      errors.push('Le poids ne peut pas dépasser 200 kg')
    }
  }
  
  // Validation de la durée
  if (formData.value.duree_estimee_heures) {
    if (formData.value.duree_estimee_heures < 0.1) {
      errors.push('La durée minimale est de 0.1 heure')
    }
    if (formData.value.duree_estimee_heures > 24) {
      errors.push('La durée ne peut pas dépasser 24 heures')
    }
  }
  
  // Validation des dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (formData.value.date_livraison_souhaitee) {
    const dateLivraison = new Date(formData.value.date_livraison_souhaitee)
    if (dateLivraison < today) {
      errors.push('La date de livraison ne peut pas être dans le passé')
    }
  }
  
  if (formData.value.date_prestation_souhaitee) {
    const datePrestation = new Date(formData.value.date_prestation_souhaitee)
    if (datePrestation < today) {
      errors.push('La date de prestation ne peut pas être dans le passé')
    }
  }
  
  return errors
})

// Méthodes
const handleSubmit = async () => {
  if (!isFormValid.value) {
    notifyError('Formulaire invalide', 'Veuillez corriger les erreurs avant de soumettre')
    return
  }
  
  if (validationErrors.value.length > 0) {
    notifyError('Erreurs de validation', 'Veuillez corriger les erreurs affichées')
    return
  }
  
  loading.value = true
  try {
    // Nettoyer les données avant envoi - enlever les champs vides selon le type d'annonce
    const cleanedData = { ...formData.value }
    
    if (cleanedData.type_annonce === 'livraison') {
      // Pour une livraison, supprimer les champs prestation vides
      delete cleanedData.type_prestation
      delete cleanedData.date_prestation_souhaitee
      delete cleanedData.duree_estimee_heures
    } else {
      // Pour une prestation, supprimer les champs livraison vides
      delete cleanedData.adresse_depart
      delete cleanedData.adresse_arrivee
      delete cleanedData.date_livraison_souhaitee
      delete cleanedData.poids_colis
      delete cleanedData.dimensions_colis
    }
    
    // Supprimer les champs null ou vides
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === null || cleanedData[key] === '') {
        delete cleanedData[key]
      }
    })
    
    const response = await api.post('/annonces', cleanedData)
    
    if (response.data.success) {
      notifySuccess('Succès', 'Votre annonce a été créée avec succès')
      emit('created', response.data.data)
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error)
    notifyError('Erreur', error.response?.data?.error || 'Impossible de créer l\'annonce')
  } finally {
    loading.value = false
  }
}
</script>