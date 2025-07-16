<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mon portefeuille</h1>
        <p class="text-gray-600">Suivez vos revenus et gérez vos paiements</p>
      </div>
      <button
        @click="requestPayout"
        :disabled="wallet.solde < minPayout"
        class="btn btn-primary"
      >
        Demander un virement
      </button>
    </div>

    <!-- Résumé financier -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100">Solde disponible</p>
            <p class="text-3xl font-bold">{{ wallet.solde }}€</p>
          </div>
          <CurrencyEuroIcon class="h-12 w-12 text-green-200" />
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ChartBarIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Ce mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.revenusMois }}€</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CalendarIcon class="h-8 w-8 text-purple-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Cette semaine</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.revenusSemaine }}€</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <TruckIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Livraisons</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.nbLivraisons }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objectifs et performances -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Objectifs -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Objectifs du mois</h3>
        
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Revenus mensuel</span>
              <span class="text-sm text-gray-500">{{ stats.revenusMois }}€ / {{ objectifs.revenus }}€</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min((stats.revenusMois / objectifs.revenus) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Livraisons</span>
              <span class="text-sm text-gray-500">{{ stats.nbLivraisons }} / {{ objectifs.livraisons }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min((stats.nbLivraisons / objectifs.livraisons) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenus par jour -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Revenus des 7 derniers jours</h3>
        
        <div class="space-y-3">
          <div 
            v-for="jour in revenusJours" 
            :key="jour.date"
            class="flex justify-between items-center"
          >
            <span class="text-sm text-gray-600">{{ formatJour(jour.date) }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-emerald-500 h-2 rounded-full"
                  :style="{ width: `${(jour.revenus / maxRevenuJour) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-12">{{ jour.revenus }}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions récentes -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Transactions récentes</h3>
        <div class="flex space-x-2">
          <select v-model="filters.type" class="input-field text-sm">
            <option value="">Tous les types</option>
            <option value="livraison">Livraison</option>
            <option value="bonus">Bonus</option>
            <option value="remboursement">Remboursement</option>
            <option value="virement">Virement</option>
          </select>
          <select v-model="filters.periode" class="input-field text-sm">
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="3m">3 derniers mois</option>
          </select>
        </div>
      </div>
      
      <div v-if="isLoadingTransactions" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des transactions...</p>
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="p-8 text-center">
        <CurrencyEuroIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune transaction trouvée</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in filteredTransactions" :key="transaction.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDateTime(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getTypeClass(transaction.type)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getTypeLabel(transaction.type) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ transaction.description }}</div>
                <div v-if="transaction.reference" class="text-sm text-gray-500">
                  Réf: {{ transaction.reference }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="transaction.montant > 0 ? 'text-green-600' : 'text-red-600'"
                  class="text-sm font-medium"
                >
                  {{ transaction.montant > 0 ? '+' : '' }}{{ transaction.montant }}€
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(transaction.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(transaction.statut) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Informations bancaires -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Informations bancaires</h3>
        <button
          @click="showBankModal = true"
          class="btn btn-secondary"
        >
          Modifier
        </button>
      </div>
      
      <div v-if="bankInfo.iban" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="label-field">IBAN</label>
          <p class="text-sm text-gray-900 font-mono">{{ formatIban(bankInfo.iban) }}</p>
        </div>
        <div>
          <label class="label-field">Nom du titulaire</label>
          <p class="text-sm text-gray-900">{{ bankInfo.titulaire }}</p>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <ExclamationTriangleIcon class="h-12 w-12 text-yellow-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune information bancaire configurée</p>
        <button
          @click="showBankModal = true"
          class="mt-4 btn btn-primary"
        >
          Ajouter mes informations bancaires
        </button>
      </div>
    </div>

    <!-- Modal informations bancaires -->
    <div
      v-if="showBankModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showBankModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Informations bancaires
          </h3>
          
          <form @submit.prevent="saveBankInfo" class="space-y-4">
            <div>
              <label class="label-field">IBAN</label>
              <input
                v-model="editBankInfo.iban"
                type="text"
                class="input-field"
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                required
              />
            </div>
            
            <div>
              <label class="label-field">Nom du titulaire</label>
              <input
                v-model="editBankInfo.titulaire"
                type="text"
                class="input-field"
                placeholder="Jean Dupont"
                required
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showBankModal = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSavingBank"
                class="btn btn-primary"
              >
                <span v-if="isSavingBank" class="spinner mr-2"></span>
                Enregistrer
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
import { useAppStore } from '@/stores/app'
import { livreurService } from '@/services/livreurService'
import { useNotifications } from '@/composables/useNotifications'
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  CalendarIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const appStore = useAppStore()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoadingTransactions = ref(true)
const isSavingBank = ref(false)
const showBankModal = ref(false)
const minPayout = 20 // Minimum pour demander un virement

// Données du portefeuille
const wallet = ref({
  solde: 0
})

// Statistiques
const stats = ref({
  revenusMois: 0,
  revenusSemaine: 0,
  nbLivraisons: 0
})

// Objectifs
const objectifs = ref({
  revenus: 0,
  livraisons: 0
})

// Revenus par jour
const revenusJours = ref([])

// Transactions
const transactions = ref([])

// Filtres
const filters = ref({
  type: '',
  periode: '30j'
})

// Informations bancaires
const bankInfo = ref({
  iban: '',
  titulaire: ''
})

const editBankInfo = ref({
  iban: '',
  titulaire: ''
})

// Computed
const maxRevenuJour = computed(() => {
  return Math.max(...revenusJours.value.map(j => j.revenus))
})

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (filters.value.type) {
    filtered = filtered.filter(t => t.type === filters.value.type)
  }

  // Filtrage par période (simulation)
  return filtered
})

// Méthodes
const loadTransactions = async () => {
  try {
    isLoadingTransactions.value = true
    
    const response = await livreurService.getTransactions(filters.value)
    
    if (response.success) {
      transactions.value = response.data || []
    } else {
      transactions.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error)
    transactions.value = []
    handleApiError(error, 'Impossible de charger les transactions')
  } finally {
    isLoadingTransactions.value = false
  }
}

const requestPayout = async () => {
  if (wallet.value.solde < minPayout) {
    notifyError('Solde insuffisant', `Le solde minimum pour un virement est de ${minPayout}€`)
    return
  }

  if (!bankInfo.value.iban) {
    notifyError('Informations manquantes', 'Veuillez configurer vos informations bancaires')
    showBankModal.value = true
    return
  }

  try {
    const response = await livreurService.requestPayout(wallet.value.solde)
    
    if (response.success) {
      notifySuccess('Demande envoyée', response.message || 'Votre demande de virement a été prise en compte')
    } else {
      notifyError('Erreur', response.message || 'Impossible de traiter la demande')
    }
  } catch (error) {
    console.error('Erreur lors de la demande de virement:', error)
    handleApiError(error, 'Impossible de traiter la demande')
  }
}

const saveBankInfo = async () => {
  try {
    isSavingBank.value = true
    
    const response = await livreurService.updateBankInfo(editBankInfo.value)
    
    if (response.success) {
      bankInfo.value = { ...editBankInfo.value }
      showBankModal.value = false
      notifySuccess('Informations sauvegardées', response.message || 'Vos informations bancaires ont été mises à jour')
    } else {
      notifyError('Erreur', response.message || 'Impossible de sauvegarder les informations')
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    handleApiError(error, 'Impossible de sauvegarder les informations')
  } finally {
    isSavingBank.value = false
  }
}

const getTypeClass = (type) => {
  const classes = {
    livraison: 'bg-green-100 text-green-800',
    bonus: 'bg-blue-100 text-blue-800',
    remboursement: 'bg-yellow-100 text-yellow-800',
    virement: 'bg-purple-100 text-purple-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type) => {
  const labels = {
    livraison: 'Livraison',
    bonus: 'Bonus',
    remboursement: 'Remboursement',
    virement: 'Virement'
  }
  return labels[type] || type
}

const getStatusClass = (statut) => {
  const classes = {
    complete: 'bg-green-100 text-green-800',
    en_cours: 'bg-yellow-100 text-yellow-800',
    echec: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    complete: 'Terminé',
    en_cours: 'En cours',
    echec: 'Échec'
  }
  return labels[statut] || statut
}

const formatJour = (date) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short' }
  return new Date(date).toLocaleDateString('fr-FR', options)
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('fr-FR')
}

const formatIban = (iban) => {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

// Lifecycle
onMounted(async () => {
  await loadWalletData()
  await loadTransactions()
  
  // Préremplir le modal avec les infos existantes
  editBankInfo.value = { ...bankInfo.value }
})

// Charger les données du portefeuille
const loadWalletData = async () => {
  try {
    const response = await livreurService.getPortefeuille()
    
    if (response.success) {
      const data = response.data
      wallet.value = { solde: data.solde || 0 }
      stats.value = {
        revenusMois: data.revenusMois || 0,
        revenusSemaine: data.revenusSemaine || 0,
        nbLivraisons: data.nbLivraisons || 0
      }
      objectifs.value = {
        revenus: data.objectifRevenus || 0,
        livraisons: data.objectifLivraisons || 0
      }
      revenusJours.value = data.revenusJours || []
      
      if (data.bankInfo) {
        bankInfo.value = data.bankInfo
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du portefeuille:', error)
    handleApiError(error, 'Impossible de charger les données du portefeuille')
  }
}
</script>