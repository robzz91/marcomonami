<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Services disponibles</h1>
        <p class="text-gray-600">Découvrez tous les services proposés par nos partenaires</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="showFilters = !showFilters"
          class="btn btn-secondary"
        >
          <FunnelIcon class="h-4 w-4 mr-2" />
          Filtres
        </button>
      </div>
    </div>

    <!-- Barre de recherche -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex space-x-4">
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            class="input-field"
            placeholder="Rechercher un service, une catégorie, un prestataire..."
          />
        </div>
        <div>
          <select v-model="selectedLocation" class="input-field">
            <option value="">Toutes les localisations</option>
            <option value="paris">Paris</option>
            <option value="lyon">Lyon</option>
            <option value="marseille">Marseille</option>
            <option value="toulouse">Toulouse</option>
          </select>
        </div>
        <div>
          <button
            @click="resetSearch"
            class="btn btn-secondary"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Filtres avancés -->
    <div v-if="showFilters" class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Filtres avancés</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-field">Catégorie</label>
          <select v-model="filters.categorie" class="input-field">
            <option value="">Toutes les catégories</option>
            <option value="livraison">Livraison</option>
            <option value="menage">Ménage</option>
            <option value="jardinage">Jardinage</option>
            <option value="bricolage">Bricolage</option>
            <option value="informatique">Informatique</option>
            <option value="sante">Santé & Bien-être</option>
          </select>
        </div>
        <div>
          <label class="label-field">Prix maximum (€)</label>
          <input
            type="number"
            v-model="filters.prixMax"
            class="input-field"
            placeholder="100"
            min="0"
          />
        </div>
        <div>
          <label class="label-field">Note minimum</label>
          <select v-model="filters.noteMin" class="input-field">
            <option value="">Toutes les notes</option>
            <option value="4">4★ et plus</option>
            <option value="3">3★ et plus</option>
            <option value="2">2★ et plus</option>
          </select>
        </div>
        <div>
          <label class="label-field">Disponibilité</label>
          <select v-model="filters.disponibilite" class="input-field">
            <option value="">Toutes</option>
            <option value="immediate">Immédiate</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Catégories populaires -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Catégories populaires</h3>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <button
          v-for="categorie in categories"
          :key="categorie.id"
          @click="selectCategory(categorie.id)"
          class="flex flex-col items-center p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <component :is="categorie.icon" class="h-8 w-8 text-primary-600 mb-2" />
          <span class="text-sm font-medium text-gray-900">{{ categorie.nom }}</span>
          <span class="text-xs text-gray-500">{{ categorie.count }} services</span>
        </button>
      </div>
    </div>

    <!-- Liste des services -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>

    <div v-else-if="filteredServices.length === 0" class="text-center py-12">
      <WrenchScrewdriverIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">Aucun service trouvé pour votre recherche</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="service in filteredServices"
        :key="service.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
      >
        <!-- Image du service -->
        <div class="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            v-if="service.image"
            :src="service.image"
            :alt="service.titre"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex items-center justify-center h-full">
            <WrenchScrewdriverIcon class="h-12 w-12 text-gray-400" />
          </div>
          
          <!-- Badge de catégorie -->
          <div class="absolute top-2 left-2">
            <span class="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {{ service.categorie }}
            </span>
          </div>
          
          <!-- Badge de prix -->
          <div class="absolute top-2 right-2">
            <span class="bg-white text-gray-900 px-2 py-1 rounded-full text-sm font-bold">
              {{ service.prix }}€
            </span>
          </div>
        </div>

        <!-- Contenu -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900 flex-1">{{ service.titre }}</h3>
          </div>

          <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ service.description }}</p>

          <!-- Prestataire -->
          <div class="flex items-center mb-3">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon class="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ service.prestataire_nom }}</p>
              <div class="flex items-center">
                <div class="flex items-center">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="i <= service.note ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-4 w-4 fill-current"
                  />
                </div>
                <span class="ml-1 text-xs text-gray-500">({{ service.nb_avis }})</span>
              </div>
            </div>
          </div>

          <!-- Localisation et disponibilité -->
          <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div class="flex items-center">
              <MapPinIcon class="h-4 w-4 mr-1" />
              <span>{{ service.localisation }}</span>
            </div>
            <div class="flex items-center">
              <ClockIcon class="h-4 w-4 mr-1" />
              <span>{{ service.disponibilite }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              @click="viewService(service)"
              class="flex-1 btn btn-secondary text-sm"
            >
              Voir détails
            </button>
            <button
              @click="reserveService(service)"
              class="flex-1 btn btn-primary text-sm"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réservation -->
    <div
      v-if="showReservationModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showReservationModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Réserver un service
          </h3>
          
          <div v-if="selectedService" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900">{{ selectedService.titre }}</h4>
              <p class="text-sm text-gray-600">{{ selectedService.prestataire_nom }}</p>
              <p class="text-lg font-bold text-primary-600">{{ selectedService.prix }}€</p>
            </div>
            
            <form @submit.prevent="confirmReservation" class="space-y-4">
              <div>
                <label class="label-field">Date souhaitée</label>
                <input
                  v-model="reservationForm.date"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
              
              <div>
                <label class="label-field">Créneau horaire</label>
                <select v-model="reservationForm.creneau" class="input-field" required>
                  <option value="">Sélectionner un créneau</option>
                  <option value="matin">Matin (8h-12h)</option>
                  <option value="apres-midi">Après-midi (14h-18h)</option>
                  <option value="soir">Soir (18h-20h)</option>
                </select>
              </div>
              
              <div>
                <label class="label-field">Message pour le prestataire (optionnel)</label>
                <textarea
                  v-model="reservationForm.message"
                  class="input-field"
                  rows="3"
                  placeholder="Précisions sur votre demande..."
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="showReservationModal = false"
                  class="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isReserving"
                  class="btn btn-primary"
                >
                  <span v-if="isReserving" class="spinner mr-2"></span>
                  Confirmer la réservation
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
import { useRouter } from 'vue-router'
import { clientService } from '@/services/clientService'
import { useNotifications } from '@/composables/useNotifications'
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  HomeIcon,
  ComputerDesktopIcon,
  HeartIcon,
  WrenchIcon,
  FunnelIcon,
  UserIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { notifySuccess, notifyError, handleApiError } = useNotifications()

// État
const isLoading = ref(true)
const isReserving = ref(false)
const showFilters = ref(false)
const showReservationModal = ref(false)
const searchQuery = ref('')
const selectedLocation = ref('')
const services = ref([])
const selectedService = ref(null)

// Filtres
const filters = ref({
  categorie: '',
  prixMax: '',
  noteMin: '',
  disponibilite: ''
})

// Formulaire de réservation
const reservationForm = ref({
  date: '',
  creneau: '',
  message: ''
})

// Catégories
const categories = ref([
  { id: 'livraison', nom: 'Livraison', icon: TruckIcon, count: 45 },
  { id: 'menage', nom: 'Ménage', icon: HomeIcon, count: 32 },
  { id: 'jardinage', nom: 'Jardinage', icon: WrenchScrewdriverIcon, count: 28 },
  { id: 'bricolage', nom: 'Bricolage', icon: WrenchIcon, count: 23 },
  { id: 'informatique', nom: 'Informatique', icon: ComputerDesktopIcon, count: 18 },
  { id: 'sante', nom: 'Santé', icon: HeartIcon, count: 15 }
])

// Computed
const filteredServices = computed(() => {
  let filtered = services.value

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s =>
      s.titre.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.prestataire_nom.toLowerCase().includes(query) ||
      s.categorie.toLowerCase().includes(query)
    )
  }

  // Filtre par localisation
  if (selectedLocation.value) {
    filtered = filtered.filter(s =>
      s.localisation.toLowerCase().includes(selectedLocation.value.toLowerCase())
    )
  }

  // Filtres avancés
  if (filters.value.categorie) {
    filtered = filtered.filter(s => s.categorie === filters.value.categorie)
  }

  if (filters.value.prixMax) {
    filtered = filtered.filter(s => s.prix <= parseInt(filters.value.prixMax))
  }

  if (filters.value.noteMin) {
    filtered = filtered.filter(s => s.note >= parseInt(filters.value.noteMin))
  }

  if (filters.value.disponibilite) {
    // Logique de filtrage par disponibilité (à implémenter selon les besoins)
  }

  return filtered
})

// Méthodes
const loadServices = async () => {
  try {
    isLoading.value = true
    
    const serviceFilters = {
      search: searchQuery.value,
      location: selectedLocation.value,
      categorie: filters.value.categorie,
      prix_max: filters.value.prixMax,
      note_min: filters.value.noteMin,
      disponibilite: filters.value.disponibilite
    }
    
    const response = await clientService.getServices(serviceFilters)
    services.value = response.services || []
  } catch (error) {
    handleApiError(error, 'Impossible de charger les services')
    services.value = []
  } finally {
    isLoading.value = false
  }
}

const selectCategory = (categorieId) => {
  filters.value.categorie = filters.value.categorie === categorieId ? '' : categorieId
  showFilters.value = false
}

const resetSearch = () => {
  searchQuery.value = ''
  selectedLocation.value = ''
  filters.value = {
    categorie: '',
    prixMax: '',
    noteMin: '',
    disponibilite: ''
  }
}

const viewService = (service) => {
  router.push(`/app/client/services/${service.id}`)
}

const reserveService = (service) => {
  selectedService.value = service
  showReservationModal.value = true
  
  // Définir une date par défaut (demain)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  reservationForm.value.date = tomorrow.toISOString().split('T')[0]
}

const confirmReservation = async () => {
  try {
    isReserving.value = true
    
    const reservationData = {
      date_souhaitee: reservationForm.value.date,
      creneau: reservationForm.value.creneau,
      message: reservationForm.value.message
    }
    
    await clientService.reserveService(selectedService.value.id, reservationData)
    
    notifySuccess('Réservation confirmée', 'Votre demande a été envoyée au prestataire')
    
    showReservationModal.value = false
    reservationForm.value = { date: '', creneau: '', message: '' }
    
    // Rediriger vers les prestations
    router.push('/app/client/prestations')
  } catch (error) {
    handleApiError(error, 'Impossible de confirmer la réservation')
  } finally {
    isReserving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>