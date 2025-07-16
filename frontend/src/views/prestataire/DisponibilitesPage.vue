<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes disponibilités</h1>
        <p class="text-gray-600">Gérez votre planning et vos créneaux disponibles</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          Ajouter créneau
        </button>
        <button
          @click="viewCalendar = !viewCalendar"
          class="btn btn-secondary"
        >
          {{ viewCalendar ? 'Vue liste' : 'Vue calendrier' }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Statut</label>
          <select v-model="filters.statut" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="disponible">Disponible</option>
            <option value="reserve">Réservé</option>
            <option value="occupe">Occupé</option>
          </select>
        </div>
        <div>
          <label class="label-field">Type</label>
          <select v-model="filters.type" class="input-field">
            <option value="">Tous les types</option>
            <option value="prestation">Prestation</option>
            <option value="consultation">Consultation</option>
            <option value="deplacement">Déplacement</option>
            <option value="pause">Pause</option>
          </select>
        </div>
        <div>
          <label class="label-field">Semaine</label>
          <input
            type="week"
            v-model="filters.semaine"
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
          <CalendarIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Créneaux cette semaine</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.creneauxSemaine }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ClockIcon class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Heures disponibles</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.heuresDisponibles }}h</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-purple-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Créneaux réservés</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.creneauxReserves }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <ChartBarIcon class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Taux d'occupation</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.tauxOccupation }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue calendrier -->
    <div v-if="viewCalendar" class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Planning de la semaine</h3>
      
      <div class="grid grid-cols-8 gap-2">
        <!-- Header avec les jours -->
        <div class="text-sm font-medium text-gray-500 p-2">Heure</div>
        <div
          v-for="jour in joursCalendrier"
          :key="jour.date"
          class="text-sm font-medium text-gray-900 p-2 text-center"
        >
          <div>{{ jour.nom }}</div>
          <div class="text-xs text-gray-500">{{ formatDateShort(jour.date) }}</div>
        </div>
        
        <!-- Créneaux horaires -->
        <template v-for="heure in heuresCalendrier" :key="heure">
          <div class="text-xs text-gray-500 p-2 border-t border-gray-100">
            {{ heure }}
          </div>
          <div
            v-for="jour in joursCalendrier"
            :key="`${jour.date}-${heure}`"
            class="border border-gray-100 p-1 min-h-[40px] relative"
            @click="createCreneauAt(jour.date, heure)"
          >
            <div
              v-for="creneau in getCreneauxForDateTime(jour.date, heure)"
              :key="creneau.id"
              :class="getCreneauClass(creneau.statut)"
              class="text-xs rounded px-1 py-0.5 mb-1 cursor-pointer truncate"
              @click.stop="editCreneau(creneau)"
            >
              {{ creneau.titre || creneau.type }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Vue liste -->
    <div v-else class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Liste des disponibilités</h3>
      </div>
      
      <div v-if="isLoading" class="p-8 text-center">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des disponibilités...</p>
      </div>

      <div v-else-if="filteredDisponibilites.length === 0" class="p-8 text-center">
        <CalendarIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600">Aucune disponibilité trouvée</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date et heure
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client/Note
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="dispo in filteredDisponibilites" :key="dispo.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatDate(dispo.date) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ dispo.heure_debut }} - {{ dispo.heure_fin }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getTypeClass(dispo.type)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getTypeLabel(dispo.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ calculateDuration(dispo.heure_debut, dispo.heure_fin) }}h
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(dispo.statut)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusLabel(dispo.statut) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="dispo.client_nom" class="text-sm text-gray-900">
                  {{ dispo.client_nom }}
                </div>
                <div v-else-if="dispo.note" class="text-sm text-gray-500">
                  {{ dispo.note }}
                </div>
                <div v-else class="text-sm text-gray-400">-</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="editCreneau(dispo)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Modifier
                </button>
                <button
                  v-if="dispo.statut === 'disponible'"
                  @click="duplicateCreneau(dispo)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Dupliquer
                </button>
                <button
                  @click="deleteCreneau(dispo)"
                  class="text-red-600 hover:text-red-900"
                >
                  Supprimer
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
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Nouveau créneau' : 'Modifier le créneau' }}
          </h3>
          
          <form @submit.prevent="saveCreneau" class="space-y-4">
            <div>
              <label class="label-field">Type de créneau</label>
              <select v-model="creneauForm.type" class="input-field" required>
                <option value="">Sélectionner un type</option>
                <option value="prestation">Prestation</option>
                <option value="consultation">Consultation</option>
                <option value="deplacement">Déplacement</option>
                <option value="pause">Pause</option>
              </select>
            </div>
            
            <div>
              <label class="label-field">Date</label>
              <input
                v-model="creneauForm.date"
                type="date"
                class="input-field"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Heure de début</label>
                <input
                  v-model="creneauForm.heure_debut"
                  type="time"
                  class="input-field"
                  required
                />
              </div>
              <div>
                <label class="label-field">Heure de fin</label>
                <input
                  v-model="creneauForm.heure_fin"
                  type="time"
                  class="input-field"
                  required
                />
              </div>
            </div>
            
            <div>
              <label class="label-field">Titre/Description (optionnel)</label>
              <input
                v-model="creneauForm.titre"
                type="text"
                class="input-field"
                placeholder="Description du créneau"
              />
            </div>
            
            <div>
              <label class="label-field">Note privée (optionnel)</label>
              <textarea
                v-model="creneauForm.note"
                class="input-field"
                rows="2"
                placeholder="Note personnelle..."
              ></textarea>
            </div>
            
            <div class="flex items-center">
              <input
                id="recurrent"
                v-model="creneauForm.recurrent"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="recurrent" class="ml-2 text-sm text-gray-900">
                Répéter chaque semaine
              </label>
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
import { prestataireService } from '@/services/prestataireService'
import { useNotifications } from '@/composables/useNotifications'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const { notifySuccess, notifyError, notifyWarning, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isSaving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const viewCalendar = ref(false)
const disponibilites = ref([])
const selectedCreneau = ref(null)

// Filtres
const filters = ref({
  statut: '',
  type: '',
  semaine: ''
})

// Formulaire de créneau
const creneauForm = ref({
  type: '',
  date: '',
  heure_debut: '',
  heure_fin: '',
  titre: '',
  note: '',
  recurrent: false
})

// Statistiques
const stats = ref({
  creneauxSemaine: 0,
  heuresDisponibles: 0,
  creneauxReserves: 0,
  tauxOccupation: 0
})

// Calendrier
const joursCalendrier = ref([])
const heuresCalendrier = ref([
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
])

// Computed
const filteredDisponibilites = computed(() => {
  let filtered = disponibilites.value

  if (filters.value.statut) {
    filtered = filtered.filter(d => d.statut === filters.value.statut)
  }

  if (filters.value.type) {
    filtered = filtered.filter(d => d.type === filters.value.type)
  }

  if (filters.value.semaine) {
    // Filtrage par semaine (à implémenter selon les besoins)
  }

  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
})

// Méthodes
const loadDisponibilites = async () => {
  try {
    isLoading.value = true
    
    const response = await prestataireService.getDisponibilites(filters.value)
    disponibilites.value = response.disponibilites || []

    // Générer le calendrier de la semaine courante
    generateWeekCalendar()

    // Calcul des stats
    const creneauxSemaine = disponibilites.value.filter(d => isThisWeek(d.date)).length
    const heuresDisponibles = disponibilites.value
      .filter(d => d.statut === 'disponible')
      .reduce((sum, d) => sum + calculateDuration(d.heure_debut, d.heure_fin), 0)
    
    stats.value = {
      creneauxSemaine,
      heuresDisponibles,
      creneauxReserves: disponibilites.value.filter(d => d.statut === 'reserve').length,
      tauxOccupation: creneauxSemaine > 0 ? Math.round((disponibilites.value.filter(d => d.statut !== 'disponible').length / creneauxSemaine) * 100) : 0
    }
  } catch (error) {
    handleApiError(error, 'Impossible de charger les disponibilités')
  } finally {
    isLoading.value = false
  }
}

const generateWeekCalendar = () => {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)

  joursCalendrier.value = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    
    joursCalendrier.value.push({
      date: day.toISOString().split('T')[0],
      nom: day.toLocaleDateString('fr-FR', { weekday: 'short' })
    })
  }
}

const saveCreneau = async () => {
  try {
    isSaving.value = true
    
    // Validation
    if (creneauForm.value.heure_debut >= creneauForm.value.heure_fin) {
      notifyWarning('Heures invalides', 'L\'heure de fin doit être après l\'heure de début')
      return
    }
    
    if (showCreateModal.value) {
      await prestataireService.createDisponibilite(creneauForm.value)
      notifySuccess('Créneau créé', 'Votre créneau a été ajouté avec succès')
    } else {
      await prestataireService.updateDisponibilite(selectedCreneau.value.id, creneauForm.value)
      notifySuccess('Créneau modifié', 'Votre créneau a été mis à jour')
    }
    
    closeModals()
    loadDisponibilites()
  } catch (error) {
    handleApiError(error, 'Impossible de sauvegarder le créneau')
  } finally {
    isSaving.value = false
  }
}

const createCreneauAt = (date, heure) => {
  creneauForm.value = {
    type: 'prestation',
    date,
    heure_debut: heure,
    heure_fin: addHour(heure, 1),
    titre: '',
    note: '',
    recurrent: false
  }
  showCreateModal.value = true
}

const editCreneau = (creneau) => {
  selectedCreneau.value = creneau
  creneauForm.value = { ...creneau }
  showEditModal.value = true
}

const duplicateCreneau = async (creneau) => {
  try {
    const nextWeekDate = new Date(creneau.date)
    nextWeekDate.setDate(nextWeekDate.getDate() + 7)
    const targetDate = nextWeekDate.toISOString().split('T')[0]
    
    await prestataireService.duplicateDisponibilite(creneau.id, targetDate)
    
    notifySuccess('Créneau dupliqué', 'Le créneau a été dupliqué pour la semaine suivante')
    
    loadDisponibilites()
  } catch (error) {
    handleApiError(error, 'Impossible de dupliquer le créneau')
  }
}

const deleteCreneau = async (creneau) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return

  try {
    await prestataireService.deleteDisponibilite(creneau.id)
    
    const index = disponibilites.value.findIndex(d => d.id === creneau.id)
    if (index > -1) {
      disponibilites.value.splice(index, 1)
    }
    
    notifySuccess('Créneau supprimé', 'Le créneau a été supprimé')
  } catch (error) {
    handleApiError(error, 'Impossible de supprimer le créneau')
  }
}

const getCreneauxForDateTime = (date, heure) => {
  return disponibilites.value.filter(d => 
    d.date === date && 
    d.heure_debut <= heure && 
    d.heure_fin > heure
  )
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedCreneau.value = null
  creneauForm.value = {
    type: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    titre: '',
    note: '',
    recurrent: false
  }
}

const resetFilters = () => {
  filters.value = {
    statut: '',
    type: '',
    semaine: ''
  }
}

// Utilitaires
const calculateDuration = (debut, fin) => {
  const [hDebut, mDebut] = debut.split(':').map(Number)
  const [hFin, mFin] = fin.split(':').map(Number)
  
  const minutesDebut = hDebut * 60 + mDebut
  const minutesFin = hFin * 60 + mFin
  
  return (minutesFin - minutesDebut) / 60
}

const addHour = (time, hours) => {
  const [h, m] = time.split(':').map(Number)
  const newHour = (h + hours) % 24
  return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const isThisWeek = (date) => {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  const checkDate = new Date(date)
  return checkDate >= monday && checkDate <= sunday
}

const getCreneauClass = (statut) => {
  const classes = {
    disponible: 'bg-green-100 text-green-800',
    reserve: 'bg-blue-100 text-blue-800',
    occupe: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (statut) => {
  const classes = {
    disponible: 'bg-green-100 text-green-800',
    reserve: 'bg-blue-100 text-blue-800',
    occupe: 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (statut) => {
  const labels = {
    disponible: 'Disponible',
    reserve: 'Réservé',
    occupe: 'Occupé'
  }
  return labels[statut] || statut
}

const getTypeClass = (type) => {
  const classes = {
    prestation: 'bg-purple-100 text-purple-800',
    consultation: 'bg-blue-100 text-blue-800',
    deplacement: 'bg-yellow-100 text-yellow-800',
    pause: 'bg-gray-100 text-gray-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type) => {
  const labels = {
    prestation: 'Prestation',
    consultation: 'Consultation',
    deplacement: 'Déplacement',
    pause: 'Pause'
  }
  return labels[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Lifecycle
onMounted(() => {
  loadDisponibilites()
  
  // Définir la date par défaut (aujourd'hui)
  const today = new Date().toISOString().split('T')[0]
  creneauForm.value.date = today
})
</script>