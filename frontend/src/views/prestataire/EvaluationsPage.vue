<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes évaluations</h1>
        <p class="text-gray-600">Consultez les avis et notes de vos clients</p>
      </div>
      <div class="text-right">
        <div class="flex items-center space-x-2">
          <div class="flex items-center">
            <StarIcon
              v-for="i in 5"
              :key="i"
              :class="i <= Math.round(stats.noteMoyenne) ? 'text-yellow-400' : 'text-gray-300'"
              class="h-6 w-6 fill-current"
            />
          </div>
          <span class="text-2xl font-bold text-gray-900">{{ stats.noteMoyenne }}/5</span>
        </div>
        <p class="text-sm text-gray-600">{{ stats.totalAvis }} avis</p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Note</label>
          <select v-model="filters.note" class="input-field">
            <option value="">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>
        </div>
        <div>
          <label class="label-field">Prestation</label>
          <select v-model="filters.prestation" class="input-field">
            <option value="">Toutes les prestations</option>
            <option value="menage">Ménage</option>
            <option value="jardinage">Jardinage</option>
            <option value="bricolage">Bricolage</option>
            <option value="informatique">Informatique</option>
          </select>
        </div>
        <div>
          <label class="label-field">Période</label>
          <select v-model="filters.periode" class="input-field">
            <option value="">Toutes les périodes</option>
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="3m">3 derniers mois</option>
            <option value="6m">6 derniers mois</option>
          </select>
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

    <!-- Statistiques détaillées -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Répartition des notes -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition des notes</h3>
        
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center">
            <div class="flex items-center w-16">
              <span class="text-sm text-gray-600">{{ 6 - i }}</span>
              <StarIcon class="h-4 w-4 text-yellow-400 fill-current ml-1" />
            </div>
            <div class="flex-1 mx-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(stats.repartition[6-i] / stats.totalAvis) * 100}%` }"
                ></div>
              </div>
            </div>
            <span class="text-sm text-gray-600 w-8">{{ stats.repartition[6-i] }}</span>
          </div>
        </div>
      </div>

      <!-- Tendance -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Évolution récente</h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Ce mois</span>
            <div class="flex items-center space-x-2">
              <div class="flex items-center">
                <StarIcon
                  v-for="i in 5"
                  :key="i"
                  :class="i <= Math.round(stats.noteMois) ? 'text-yellow-400' : 'text-gray-300'"
                  class="h-4 w-4 fill-current"
                />
              </div>
              <span class="text-sm font-medium">{{ stats.noteMois }}/5</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Mois dernier</span>
            <div class="flex items-center space-x-2">
              <div class="flex items-center">
                <StarIcon
                  v-for="i in 5"
                  :key="i"
                  :class="i <= Math.round(stats.noteMoisDernier) ? 'text-yellow-400' : 'text-gray-300'"
                  class="h-4 w-4 fill-current"
                />
              </div>
              <span class="text-sm font-medium">{{ stats.noteMoisDernier }}/5</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Tendance</span>
            <div class="flex items-center space-x-1">
              <component 
                :is="stats.tendance >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon"
                :class="stats.tendance >= 0 ? 'text-green-500' : 'text-red-500'"
                class="h-4 w-4"
              />
              <span 
                :class="stats.tendance >= 0 ? 'text-green-600' : 'text-red-600'"
                class="text-sm font-medium"
              >
                {{ stats.tendance >= 0 ? '+' : '' }}{{ stats.tendance.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des évaluations -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Avis clients</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des évaluations...</p>
      </div>

      <div v-else-if="filteredEvaluations.length === 0" class="p-8 text-center">
        <StarIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune évaluation trouvée</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="evaluation in filteredEvaluations"
          :key="evaluation.id"
          class="p-6"
        >
          <div class="flex items-start space-x-4">
            <!-- Avatar client -->
            <div class="flex-shrink-0">
              <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon class="h-6 w-6 text-gray-600" />
              </div>
            </div>
            
            <!-- Contenu de l'évaluation -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ evaluation.client_nom }}</h4>
                  <p class="text-sm text-gray-500">{{ evaluation.prestation_titre }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="flex items-center">
                    <StarIcon
                      v-for="i in 5"
                      :key="i"
                      :class="i <= evaluation.note ? 'text-yellow-400' : 'text-gray-300'"
                      class="h-4 w-4 fill-current"
                    />
                  </div>
                  <span class="text-sm text-gray-500">{{ formatDate(evaluation.date_creation) }}</span>
                </div>
              </div>
              
              <div class="mb-3">
                <p class="text-gray-700">{{ evaluation.commentaire }}</p>
              </div>
              
              <!-- Tags d'évaluation -->
              <div v-if="evaluation.tags && evaluation.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
                <span
                  v-for="tag in evaluation.tags"
                  :key="tag"
                  class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
              
              <!-- Critères détaillés -->
              <div v-if="evaluation.criteres" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div v-for="(note, critere) in evaluation.criteres" :key="critere" class="text-center">
                  <p class="text-xs text-gray-500 mb-1">{{ getCritereLabel(critere) }}</p>
                  <div class="flex items-center justify-center">
                    <StarIcon
                      v-for="i in 5"
                      :key="i"
                      :class="i <= note ? 'text-yellow-400' : 'text-gray-300'"
                      class="h-3 w-3 fill-current"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-4">
                <button
                  v-if="!evaluation.reponse"
                  @click="showResponseModal(evaluation)"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Répondre
                </button>
                <button
                  @click="reportEvaluation(evaluation)"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  Signaler
                </button>
                <div v-if="evaluation.recommande" class="flex items-center text-green-600">
                  <CheckCircleIcon class="h-4 w-4 mr-1" />
                  <span class="text-sm">Recommande</span>
                </div>
              </div>
              
              <!-- Réponse du prestataire -->
              <div v-if="evaluation.reponse" class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center mb-2">
                  <div class="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center mr-2">
                    <span class="text-xs text-white font-medium">Vous</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">Votre réponse</span>
                  <span class="text-sm text-gray-500 ml-2">{{ formatDate(evaluation.reponse.date) }}</span>
                </div>
                <p class="text-sm text-gray-700">{{ evaluation.reponse.texte }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réponse -->
    <div
      v-if="showResponseModalFlag"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showResponseModalFlag = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Répondre à l'avis
          </h3>
          
          <div v-if="selectedEvaluation" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center mb-2">
                <div class="flex items-center">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="i <= selectedEvaluation.note ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-4 w-4 fill-current"
                  />
                </div>
                <span class="ml-2 text-sm font-medium">{{ selectedEvaluation.client_nom }}</span>
              </div>
              <p class="text-sm text-gray-700">{{ selectedEvaluation.commentaire }}</p>
            </div>
            
            <form @submit.prevent="submitResponse" class="space-y-4">
              <div>
                <label class="label-field">Votre réponse</label>
                <textarea
                  v-model="responseForm.texte"
                  class="input-field"
                  rows="4"
                  placeholder="Répondez de manière professionnelle et courtoise..."
                  required
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="showResponseModalFlag = false"
                  class="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isSubmittingResponse"
                  class="btn btn-primary"
                >
                  <span v-if="isSubmittingResponse" class="spinner mr-2"></span>
                  Publier la réponse
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
import { prestataireService } from '@/services/prestataireService'
import { useNotifications } from '@/composables/useNotifications'
import {
  StarIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/vue/24/outline'

const { notifySuccess, notifyError, notifyInfo, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isSubmittingResponse = ref(false)
const showResponseModalFlag = ref(false)
const evaluations = ref([])
const selectedEvaluation = ref(null)

// Filtres
const filters = ref({
  note: '',
  prestation: '',
  periode: ''
})

// Formulaire de réponse
const responseForm = ref({
  texte: ''
})

// Statistiques
const stats = ref({
  noteMoyenne: 0,
  totalAvis: 0,
  repartition: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  noteMois: 0,
  noteMoisDernier: 0,
  tendance: 0
})

// Computed
const filteredEvaluations = computed(() => {
  let filtered = evaluations.value

  if (filters.value.note) {
    filtered = filtered.filter(e => e.note === parseInt(filters.value.note))
  }

  if (filters.value.prestation) {
    filtered = filtered.filter(e => e.prestation_type === filters.value.prestation)
  }

  if (filters.value.periode) {
    const now = new Date()
    let dateLimit = new Date()
    
    switch (filters.value.periode) {
      case '7j':
        dateLimit.setDate(now.getDate() - 7)
        break
      case '30j':
        dateLimit.setDate(now.getDate() - 30)
        break
      case '3m':
        dateLimit.setMonth(now.getMonth() - 3)
        break
      case '6m':
        dateLimit.setMonth(now.getMonth() - 6)
        break
    }
    
    filtered = filtered.filter(e => new Date(e.date_creation) >= dateLimit)
  }

  return filtered.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
})

// Méthodes
const loadEvaluations = async () => {
  try {
    isLoading.value = true
    
    const response = await prestataireService.getEvaluations(filters.value)
    evaluations.value = response.evaluations || []

    // Calcul des statistiques
    const totalAvis = evaluations.value.length
    const noteMoyenne = totalAvis > 0 ? evaluations.value.reduce((sum, e) => sum + e.note, 0) / totalAvis : 0
    
    const repartition = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    evaluations.value.forEach(e => {
      repartition[e.note]++
    })

    // Calcul des notes du mois
    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1)
    const debutMoisDernier = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const finMoisDernier = new Date(now.getFullYear(), now.getMonth(), 0)

    const avisMois = evaluations.value.filter(e => new Date(e.date_creation) >= debutMois)
    const avisMoisDernier = evaluations.value.filter(e => {
      const date = new Date(e.date_creation)
      return date >= debutMoisDernier && date <= finMoisDernier
    })

    const noteMois = avisMois.length > 0 ? avisMois.reduce((sum, e) => sum + e.note, 0) / avisMois.length : 0
    const noteMoisDernier = avisMoisDernier.length > 0 ? avisMoisDernier.reduce((sum, e) => sum + e.note, 0) / avisMoisDernier.length : 0
    
    stats.value = {
      noteMoyenne: parseFloat(noteMoyenne.toFixed(1)),
      totalAvis,
      repartition,
      noteMois: parseFloat(noteMois.toFixed(1)),
      noteMoisDernier: parseFloat(noteMoisDernier.toFixed(1)),
      tendance: noteMoisDernier > 0 ? ((noteMois - noteMoisDernier) / noteMoisDernier) * 100 : 0
    }
  } catch (error) {
    handleApiError(error, 'Impossible de charger les évaluations')
  } finally {
    isLoading.value = false
  }
}

const showResponseModal = (evaluation) => {
  selectedEvaluation.value = evaluation
  showResponseModalFlag.value = true
  responseForm.value.texte = ''
}

const submitResponse = async () => {
  try {
    isSubmittingResponse.value = true
    
    await prestataireService.replyToEvaluation(selectedEvaluation.value.id, responseForm.value)
    
    selectedEvaluation.value.reponse = {
      date: new Date().toISOString().split('T')[0],
      texte: responseForm.value.texte
    }
    
    showResponseModalFlag.value = false
    
    notifySuccess('Réponse publiée', 'Votre réponse a été publiée avec succès')
  } catch (error) {
    handleApiError(error, 'Impossible de publier la réponse')
  } finally {
    isSubmittingResponse.value = false
  }
}

const reportEvaluation = async (evaluation) => {
  if (!confirm('Voulez-vous signaler cet avis comme inapproprié ?')) return

  try {
    const reason = prompt('Raison du signalement (optionnel):') || ''
    
    await prestataireService.reportEvaluation(evaluation.id, { reason })
    
    notifyInfo('Avis signalé', 'L\'avis a été signalé à notre équipe de modération')
  } catch (error) {
    handleApiError(error, 'Impossible de signaler l\'avis')
  }
}

const resetFilters = () => {
  filters.value = {
    note: '',
    prestation: '',
    periode: ''
  }
}

const getCritereLabel = (critere) => {
  const labels = {
    qualite: 'Qualité',
    ponctualite: 'Ponctualité',
    communication: 'Communication',
    proprete: 'Propreté'
  }
  return labels[critere] || critere
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadEvaluations()
})
</script>