<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tableau de bord Client</h1>
          <p class="text-gray-600">Bienvenue {{ authStore.userName }}, découvrez nos services</p>
        </div>
        <div class="flex space-x-3">
          <router-link to="/app/client/services/recherche" class="btn-primary">
            Rechercher un service
          </router-link>
          <router-link to="/app/client/annonces/nouvelle" class="btn-secondary">
            Créer une annonce
          </router-link>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CalendarDaysIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Services réservés
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.servicesReserves }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <MegaphoneIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Mes annonces
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.mesAnnonces }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyEuroIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Dépenses du mois
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ formatCurrency(stats.depensesMois) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <StarIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Note moyenne donnée
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.noteMoyenne }}/5
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Services à venir -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Prochains services</h2>
          <router-link to="/app/client/reservations" class="text-sm text-primary-600 hover:text-primary-500">
            Voir toutes mes réservations
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div v-if="prochainesReservations.length === 0" class="text-center py-8">
          <CalendarDaysIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun service prévu</h3>
          <p class="mt-1 text-sm text-gray-500">Recherchez et réservez vos premiers services</p>
          <div class="mt-6">
            <router-link to="/app/client/services/recherche" class="btn-primary">
              Rechercher des services
            </router-link>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="reservation in prochainesReservations" 
            :key="reservation.id_reservation"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ reservation.nom_service }}
                  </h3>
                  <span :class="getStatutClass(reservation.statut)">
                    {{ reservation.statut }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  Prestataire: {{ reservation.nom_prestataire }}
                </p>
                <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>📅 {{ formatDateTime(reservation.date_service) }}</span>
                  <span>💰 {{ formatCurrency(reservation.prix) }}</span>
                  <span>📍 {{ reservation.lieu }}</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <router-link 
                  :to="`/app/client/reservations/${reservation.id_reservation}`"
                  class="btn-secondary btn-sm"
                >
                  Détails
                </router-link>
                <button 
                  v-if="reservation.statut === 'confirmee'"
                  @click="annulerReservation(reservation.id_reservation)"
                  class="btn-outline btn-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mes annonces actives -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Mes annonces actives</h2>
          <router-link to="/app/client/annonces" class="text-sm text-primary-600 hover:text-primary-500">
            Gérer mes annonces
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div v-if="mesAnnonces.length === 0" class="text-center py-4">
          <MegaphoneIcon class="mx-auto h-8 w-8 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">Aucune annonce active</p>
          <div class="mt-4">
            <router-link to="/app/client/annonces/nouvelle" class="btn-primary btn-sm">
              Créer une annonce
            </router-link>
          </div>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="annonce in mesAnnonces" 
            :key="annonce.id_annonce"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">{{ annonce.titre }}</h4>
              <p class="text-xs text-gray-500">{{ annonce.description }}</p>
              <div class="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                <span>{{ annonce.nb_vues }} vues</span>
                <span>{{ annonce.nb_reponses }} réponses</span>
                <span>{{ formatDate(annonce.date_creation) }}</span>
              </div>
            </div>
            <div class="flex space-x-2">
              <router-link 
                :to="`/app/client/annonces/${annonce.id_annonce}`"
                class="btn-secondary btn-sm"
              >
                Modifier
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Services populaires -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Services populaires</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="service in servicesPopulaires" 
            :key="service.id_service"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="voirService(service.id_service)"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-900">{{ service.nom }}</h4>
              <span class="text-sm font-medium text-primary-600">
                {{ formatCurrency(service.prix_moyen) }}
              </span>
            </div>
            <p class="text-xs text-gray-600 mb-2">{{ service.description }}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>⭐ {{ service.note_moyenne }}/5</span>
              <span>{{ service.nb_prestataires }} prestataires</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Actions rapides</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link 
            to="/app/client/services/recherche"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <MagnifyingGlassIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Rechercher</span>
          </router-link>
          
          <router-link 
            to="/app/client/annonces/nouvelle"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <PlusIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Créer annonce</span>
          </router-link>
          
          <router-link 
            to="/app/client/historique"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ClockIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Historique</span>
          </router-link>
          
          <router-link 
            to="/app/client/profil"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <UserCircleIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Mon profil</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import api from '@/services/api'
import {
  CalendarDaysIcon,
  MegaphoneIcon,
  CurrencyEuroIcon,
  StarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// État
const stats = ref({
  servicesReserves: 0,
  mesAnnonces: 0,
  depensesMois: 0,
  noteMoyenne: 0
})
const prochainesReservations = ref([])
const mesAnnonces = ref([])
const servicesPopulaires = ref([])
const loading = ref(true)

// Méthodes utilitaires
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatutClass = (statut) => {
  const classes = {
    'confirmee': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'en_attente': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    'en_cours': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    'terminee': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    'annulee': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  }
  return classes[statut] || classes['en_attente']
}

// Actions
const chargerDonnees = async () => {
  try {
    loading.value = true
    
    const [statsRes, reservationsRes, annoncesRes, servicesRes] = await Promise.all([
      api.get('/clients/stats'),
      api.get('/clients/reservations/prochaines'),
      api.get('/clients/annonces?limit=3'),
      api.get('/services/populaires?limit=6')
    ])
    
    stats.value = statsRes.data
    prochainesReservations.value = reservationsRes.data
    mesAnnonces.value = annoncesRes.data
    servicesPopulaires.value = servicesRes.data
    
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger les données du tableau de bord'
    })
  } finally {
    loading.value = false
  }
}

const annulerReservation = async (idReservation) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
  
  try {
    await api.put(`/clients/reservations/${idReservation}/annuler`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Réservation annulée',
      message: 'La réservation a été annulée avec succès'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible d\'annuler la réservation'
    })
  }
}

const voirService = (idService) => {
  router.push(`/app/client/services/${idService}`)
}

onMounted(() => {
  chargerDonnees()
})
</script>