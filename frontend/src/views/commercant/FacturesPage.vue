<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des factures</h1>
        <p class="text-gray-600">Créez et gérez vos factures clients</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        Nouvelle facture
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoyee">Envoyée</option>
            <option value="payee">Payée</option>
            <option value="en_retard">En retard</option>
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
          <ReceiptPercentIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total factures</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Payées</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.payees }}</p>
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
            <p class="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.chiffreAffaires }}€</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des factures -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Liste des factures</h3>
        <div class="flex space-x-2">
          <button
            @click="exportFactures"
            class="btn btn-secondary text-sm"
          >
            Exporter
          </button>
        </div>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des factures...</p>
      </div>

      <div v-else-if="filteredFactures.length === 0" class="p-8 text-center">
        <ReceiptPercentIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune facture trouvée</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facture
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date émission
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Échéance
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant HT
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant TTC
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
            <tr v-for="facture in filteredFactures" :key="facture.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ facture.numero }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ facture.objet }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ facture.client_nom }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ facture.client_email }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(facture.date_emission) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(facture.date_echeance) }}
                </div>
                <div v-if="isOverdue(facture)" class="text-xs text-red-600">
                  En retard
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ facture.montant_ht }}€
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ facture.montant_ttc }}€
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(facture.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(facture.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewFacture(facture)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Voir
                </button>
                <button
                  v-if="facture.statut === 'brouillon'"
                  @click="editFacture(facture)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Modifier
                </button>
                <button
                  v-if="facture.statut === 'brouillon'"
                  @click="sendFacture(facture)"
                  class="text-green-600 hover:text-green-900"
                >
                  Envoyer
                </button>
                <button
                  @click="downloadFacture(facture)"
                  class="text-purple-600 hover:text-purple-900"
                >
                  PDF
                </button>
                <button
                  v-if="facture.statut === 'envoyee'"
                  @click="markAsPaid(facture)"
                  class="text-emerald-600 hover:text-emerald-900"
                >
                  Marquer payée
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
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Nouvelle facture' : 'Modifier la facture' }}
          </h3>
          
          <form @submit.prevent="saveFacture" class="space-y-6">
            <!-- Informations générales -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Numéro de facture</label>
                <input
                  v-model="factureForm.numero"
                  type="text"
                  class="input-field"
                  placeholder="FACT-2024-001"
                  required
                />
              </div>
              <div>
                <label class="label-field">Date d'émission</label>
                <input
                  v-model="factureForm.date_emission"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Date d'échéance</label>
                <input
                  v-model="factureForm.date_echeance"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label class="label-field">Objet</label>
                <input
                  v-model="factureForm.objet"
                  type="text"
                  class="input-field"
                  placeholder="Prestations de janvier 2024"
                  required
                />
              </div>
            </div>

            <!-- Informations client -->
            <div class="border-t pt-4">
              <h4 class="text-md font-medium text-gray-900 mb-3">Informations client</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label-field">Nom du client</label>
                  <input
                    v-model="factureForm.client_nom"
                    type="text"
                    class="input-field"
                    placeholder="Entreprise ABC"
                    required
                  />
                </div>
                <div>
                  <label class="label-field">Email</label>
                  <input
                    v-model="factureForm.client_email"
                    type="email"
                    class="input-field"
                    placeholder="contact@entreprise.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="label-field">Adresse de facturation</label>
                <textarea
                  v-model="factureForm.client_adresse"
                  class="input-field"
                  rows="3"
                  placeholder="123 Rue de la Paix, 75001 Paris"
                  required
                ></textarea>
              </div>
            </div>

            <!-- Lignes de facturation -->
            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-md font-medium text-gray-900">Lignes de facturation</h4>
                <button
                  type="button"
                  @click="addLigne"
                  class="btn btn-secondary text-sm"
                >
                  Ajouter une ligne
                </button>
              </div>
              
              <div class="space-y-3">
                <div
                  v-for="(ligne, index) in factureForm.lignes"
                  :key="index"
                  class="grid grid-cols-6 gap-2 items-end"
                >
                  <div class="col-span-2">
                    <label class="label-field text-xs">Description</label>
                    <input
                      v-model="ligne.description"
                      type="text"
                      class="input-field text-sm"
                      placeholder="Description du produit/service"
                      required
                    />
                  </div>
                  <div>
                    <label class="label-field text-xs">Quantité</label>
                    <input
                      v-model="ligne.quantite"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input-field text-sm"
                      @input="calculateLine(ligne)"
                      required
                    />
                  </div>
                  <div>
                    <label class="label-field text-xs">Prix unitaire HT</label>
                    <input
                      v-model="ligne.prix_unitaire"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input-field text-sm"
                      @input="calculateLine(ligne)"
                      required
                    />
                  </div>
                  <div>
                    <label class="label-field text-xs">TVA (%)</label>
                    <input
                      v-model="ligne.tva"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input-field text-sm"
                      @input="calculateLine(ligne)"
                      required
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      @click="removeLigne(index)"
                      class="btn btn-secondary text-sm h-8"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totaux -->
            <div class="border-t pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div></div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Total HT:</span>
                    <span class="text-sm font-medium">{{ calculatedTotals.ht }}€</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">TVA:</span>
                    <span class="text-sm font-medium">{{ calculatedTotals.tva }}€</span>
                  </div>
                  <div class="flex justify-between border-t pt-2">
                    <span class="text-lg font-medium">Total TTC:</span>
                    <span class="text-lg font-bold">{{ calculatedTotals.ttc }}€</span>
                  </div>
                </div>
              </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { commercantService } from '@/services/commercantService'
import { useNotifications } from '@/composables/useNotifications'
import {
  ReceiptPercentIcon,
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
const factures = ref([])
const selectedFacture = ref(null)

// Filtres
const filters = ref({
  statut: '',
  client: '',
  dateDebut: '',
  dateFin: ''
})

// Formulaire de facture
const factureForm = ref({
  numero: '',
  date_emission: '',
  date_echeance: '',
  objet: '',
  client_nom: '',
  client_email: '',
  client_adresse: '',
  lignes: [
    {
      description: '',
      quantite: 1,
      prix_unitaire: 0,
      tva: 20,
      total_ht: 0,
      total_tva: 0,
      total_ttc: 0
    }
  ]
})

// Statistiques
const stats = ref({
  total: 0,
  payees: 0,
  enAttente: 0,
  chiffreAffaires: 0
})

// Computed
const filteredFactures = computed(() => {
  let filtered = factures.value

  if (filters.value.statut) {
    filtered = filtered.filter(f => f.statut === filters.value.statut)
  }

  if (filters.value.client) {
    const client = filters.value.client.toLowerCase()
    filtered = filtered.filter(f => 
      f.client_nom.toLowerCase().includes(client)
    )
  }

  if (filters.value.dateDebut) {
    filtered = filtered.filter(f => f.date_emission >= filters.value.dateDebut)
  }

  if (filters.value.dateFin) {
    filtered = filtered.filter(f => f.date_emission <= filters.value.dateFin)
  }

  return filtered
})

const calculatedTotals = computed(() => {
  const totals = factureForm.value.lignes.reduce((acc, ligne) => {
    const totalHt = (ligne.quantite || 0) * (ligne.prix_unitaire || 0)
    const totalTva = totalHt * ((ligne.tva || 0) / 100)
    
    acc.ht += totalHt
    acc.tva += totalTva
    acc.ttc += totalHt + totalTva
    
    return acc
  }, { ht: 0, tva: 0, ttc: 0 })

  return {
    ht: totals.ht.toFixed(2),
    tva: totals.tva.toFixed(2),
    ttc: totals.ttc.toFixed(2)
  }
})

// Méthodes
const loadFactures = async () => {
  try {
    isLoading.value = true
    
    const response = await commercantService.getFactures(filters.value)
    
    if (response.success) {
      factures.value = response.data || []
      
      // Charger les statistiques
      const statsResponse = await commercantService.getStatsFactures()
      if (statsResponse.success) {
        stats.value = statsResponse.data || { total: 0, payees: 0, enAttente: 0, chiffreAffaires: 0 }
      } else {
        stats.value = { total: 0, payees: 0, enAttente: 0, chiffreAffaires: 0 }
      }
    } else {
      factures.value = []
      stats.value = { total: 0, payees: 0, enAttente: 0, chiffreAffaires: 0 }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des factures:', error)
    factures.value = []
    stats.value = { total: 0, payees: 0, enAttente: 0, chiffreAffaires: 0 }
    handleApiError(error, 'Impossible de charger les factures')
  } finally {
    isLoading.value = false
  }
}

const saveFacture = async () => {
  try {
    isSaving.value = true
    
    // Calculer les totaux avant sauvegarde
    const formData = {
      ...factureForm.value,
      montant_ht: parseFloat(calculatedTotals.value.ht),
      montant_ttc: parseFloat(calculatedTotals.value.ttc)
    }
    
    let response
    if (showCreateModal.value) {
      response = await commercantService.createFacture(formData)
    } else {
      response = await commercantService.updateFacture(selectedFacture.value.id, formData)
    }
    
    if (response.success) {
      if (showCreateModal.value) {
        notifySuccess('Facture créée', response.message || 'La nouvelle facture a été créée avec succès')
      } else {
        notifySuccess('Facture modifiée', response.message || 'La facture a été mise à jour avec succès')
      }
      
      closeModals()
      loadFactures()
    } else {
      notifyError('Erreur', response.message || 'Impossible de sauvegarder la facture')
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la facture:', error)
    handleApiError(error, 'Impossible de sauvegarder la facture')
  } finally {
    isSaving.value = false
  }
}

const calculateLine = (ligne) => {
  const totalHt = (ligne.quantite || 0) * (ligne.prix_unitaire || 0)
  const totalTva = totalHt * ((ligne.tva || 0) / 100)
  
  ligne.total_ht = totalHt
  ligne.total_tva = totalTva
  ligne.total_ttc = totalHt + totalTva
}

const addLigne = () => {
  factureForm.value.lignes.push({
    description: '',
    quantite: 1,
    prix_unitaire: 0,
    tva: 20,
    total_ht: 0,
    total_tva: 0,
    total_ttc: 0
  })
}

const removeLigne = (index) => {
  if (factureForm.value.lignes.length > 1) {
    factureForm.value.lignes.splice(index, 1)
  }
}

const viewFacture = (facture) => {
  router.push(`/app/commercant/factures/${facture.id}`)
}

const editFacture = (facture) => {
  selectedFacture.value = facture
  // Charger les données de la facture dans le formulaire
  factureForm.value = { ...facture }
  showEditModal.value = true
}

const sendFacture = async (facture) => {
  try {
    const response = await commercantService.sendFacture(facture.id)
    
    if (response.success) {
      notifySuccess('Facture envoyée', response.message || 'La facture a été envoyée au client')
      loadFactures()
    } else {
      notifyError('Erreur', response.message || 'Impossible d\'envoyer la facture')
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la facture:', error)
    handleApiError(error, 'Impossible d\'envoyer la facture')
  }
}

const markAsPaid = async (facture) => {
  try {
    const paymentData = {
      date_paiement: new Date().toISOString().split('T')[0],
      montant: facture.montant_ttc
    }
    
    const response = await commercantService.markFactureAsPaid(facture.id, paymentData)
    
    if (response.success) {
      notifySuccess('Facture marquée comme payée', response.message || 'Le paiement a été enregistré')
      loadFactures()
    } else {
      notifyError('Erreur', response.message || 'Impossible de marquer la facture comme payée')
    }
  } catch (error) {
    console.error('Erreur lors du marquage de paiement:', error)
    handleApiError(error, 'Impossible de marquer la facture comme payée')
  }
}

const downloadFacture = async (facture) => {
  try {
    const pdfBlob = await commercantService.downloadFacturePDF(facture.id)
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `facture-${facture.numero}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    notifySuccess('PDF téléchargé', 'Le fichier PDF a été téléchargé avec succès')
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF:', error)
    handleApiError(error, 'Impossible de générer le PDF')
  }
}

const exportFactures = async () => {
  try {
    const exportBlob = await commercantService.exportFactures(filters.value)
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(exportBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `export-factures-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    notifySuccess('Export terminé', 'Vos factures ont été exportées avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    handleApiError(error, 'Impossible d\'exporter les factures')
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedFacture.value = null
  factureForm.value = {
    numero: '',
    date_emission: '',
    date_echeance: '',
    objet: '',
    client_nom: '',
    client_email: '',
    client_adresse: '',
    lignes: [
      {
        description: '',
        quantite: 1,
        prix_unitaire: 0,
        tva: 20,
        total_ht: 0,
        total_tva: 0,
        total_ttc: 0
      }
    ]
  }
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    client: '',
    dateDebut: '',
    dateFin: ''
  }
}

const isOverdue = (facture) => {
  return new Date(facture.date_echeance) < new Date() && facture.statut === 'envoyee'
}

const getStatusClass = (statut) => {
  const classes = {
    brouillon: 'bg-gray-100 text-gray-800',
    envoyee: 'bg-blue-100 text-blue-800',
    payee: 'bg-green-100 text-green-800',
    en_retard: 'bg-red-100 text-red-800',
    annulee: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    brouillon: 'Brouillon',
    envoyee: 'Envoyée',
    payee: 'Payée',
    en_retard: 'En retard',
    annulee: 'Annulée'
  }
  return labels[statut] || statut
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Watchers
watch(() => factureForm.value.lignes, (newLignes) => {
  newLignes.forEach(ligne => calculateLine(ligne))
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadFactures()
  
  // Définir la date par défaut
  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const echeance = nextMonth.toISOString().split('T')[0]
  
  factureForm.value.date_emission = today
  factureForm.value.date_echeance = echeance
})
</script>