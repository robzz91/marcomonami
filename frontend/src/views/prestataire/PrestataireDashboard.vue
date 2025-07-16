<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tableau de bord Prestataire</h1>
          <p class="text-gray-600">Bienvenue {{ authStore.userName }}, gérez vos services</p>
        </div>
        <div class="flex space-x-3">
          <router-link to="/app/prestataire/services/nouveau" class="btn-primary">
            Nouveau service
          </router-link>
          <router-link to="/app/prestataire/disponibilites" class="btn-secondary">
            Mes disponibilités
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
              <WrenchScrewdriverIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Services actifs
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.servicesActifs }}
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
              <CalendarDaysIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Prestations du mois
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.prestationsMois }}
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
                  Revenus du mois
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ formatCurrency(stats.revenusMois) }}
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
                  Note moyenne
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

    <!-- Prestations à venir -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Prestations à venir</h2>
          <router-link to="/app/prestataire/prestations" class="text-sm text-primary-600 hover:text-primary-500">
            Voir toutes
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div v-if="prestationsAvenir.length === 0" class="text-center py-8">
          <CalendarDaysIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune prestation prévue</h3>
          <p class="mt-1 text-sm text-gray-500">Gérez vos disponibilités pour recevoir des demandes</p>
          <div class="mt-6">
            <router-link to="/app/prestataire/disponibilites" class="btn-primary">
              Gérer mes disponibilités
            </router-link>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="prestation in prestationsAvenir" 
            :key="prestation.id_prestation"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ prestation.nom_service }}
                  </h3>
                  <span :class="getStatutClass(prestation.statut)">
                    {{ prestation.statut }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  Client: {{ prestation.nom_client }}
                </p>
                <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>📅 {{ formatDateTime(prestation.date_prestation) }}</span>
                  <span>💰 {{ formatCurrency(prestation.prix) }}</span>
                  <span>📍 {{ prestation.lieu }}</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <router-link 
                  :to="`/app/prestataire/prestations/${prestation.id_prestation}`"
                  class="btn-secondary btn-sm"
                >
                  Détails
                </router-link>
                <button 
                  v-if="prestation.statut === 'confirmee'"
                  @click="commencerPrestation(prestation.id_prestation)"
                  class="btn-primary btn-sm"
                >
                  Commencer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demandes en attente -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Demandes en attente</h2>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {{ demandesEnAttente.length }} nouvelle(s)
          </span>
        </div>
      </div>
      <div class="p-6">
        <div v-if="demandesEnAttente.length === 0" class="text-center py-4">
          <ClockIcon class="mx-auto h-8 w-8 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">Aucune demande en attente</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="demande in demandesEnAttente" 
            :key="demande.id_demande"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h4 class="text-sm font-medium text-gray-900">{{ demande.nom_service }}</h4>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Nouveau
                </span>
              </div>
              <p class="text-xs text-gray-600">Client: {{ demande.nom_client }}</p>
              <div class="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                <span>📅 {{ formatDate(demande.date_souhaitee) }}</span>
                <span>💰 {{ formatCurrency(demande.budget) }}</span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="accepterDemande(demande.id_demande)"
                class="btn-primary btn-sm"
              >
                Accepter
              </button>
              <button 
                @click="refuserDemande(demande.id_demande)"
                class="btn-outline btn-sm"
              >
                Refuser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mes services -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Mes services</h2>
          <router-link to="/app/prestataire/services" class="text-sm text-primary-600 hover:text-primary-500">
            Gérer tous mes services
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div v-if="mesServices.length === 0" class="text-center py-4">
          <WrenchScrewdriverIcon class="mx-auto h-8 w-8 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">Aucun service créé</p>
          <div class="mt-4">
            <router-link to="/app/prestataire/services/nouveau" class="btn-primary btn-sm">
              Créer mon premier service
            </router-link>
          </div>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="service in mesServices" 
            :key="service.id_service"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-900">{{ service.nom }}</h4>
              <span :class="getServiceStatutClass(service.statut)">
                {{ service.statut }}
              </span>
            </div>
            <p class="text-xs text-gray-600 mb-3">{{ service.description }}</p>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>💰 {{ formatCurrency(service.prix) }}</span>
              <span>⭐ {{ service.note_moyenne || 'N/A' }}/5</span>
            </div>
            <div class="flex space-x-2">
              <router-link 
                :to="`/app/prestataire/services/${service.id_service}`"
                class="btn-secondary btn-sm flex-1 text-center"
              >
                Modifier
              </router-link>
              <button 
                @click="toggleServiceStatut(service.id_service, service.statut)"
                :class="service.statut === 'actif' ? 'btn-outline btn-sm' : 'btn-primary btn-sm'"
              >
                {{ service.statut === 'actif' ? 'Désactiver' : 'Activer' }}
              </button>
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
            to="/app/prestataire/services/nouveau"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <PlusIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Nouveau service</span>
          </router-link>
          
          <router-link 
            to="/app/prestataire/evaluations"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StarIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Évaluations</span>
          </router-link>
          
          <router-link 
            to="/app/prestataire/revenus"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChartBarIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Revenus</span>
          </router-link>
          
          <router-link 
            to="/app/prestataire/profil"
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
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import api from '@/services/api'
import {
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  StarIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const appStore = useAppStore()

// État
const stats = ref({
  servicesActifs: 0,
  prestationsMois: 0,
  revenusMois: 0,
  noteMoyenne: 0
})
const prestationsAvenir = ref([])
const demandesEnAttente = ref([])
const mesServices = ref([])
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

const getServiceStatutClass = (statut) => {
  const classes = {
    'actif': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800',
    'inactif': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'
  }
  return classes[statut] || classes['inactif']
}

// Actions
const chargerDonnees = async () => {
  try {
    loading.value = true
    
    const [statsRes, prestationsRes, demandesRes, servicesRes] = await Promise.all([
      api.get('/prestataires/stats'),
      api.get('/prestataires/prestations/a-venir'),
      api.get('/prestataires/demandes/en-attente'),
      api.get('/prestataires/services?limit=6')
    ])
    
    stats.value = statsRes.data
    prestationsAvenir.value = prestationsRes.data
    demandesEnAttente.value = demandesRes.data
    mesServices.value = servicesRes.data
    
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

const commencerPrestation = async (idPrestation) => {
  try {
    await api.put(`/prestataires/prestations/${idPrestation}/commencer`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Prestation commencée',
      message: 'La prestation a été marquée comme commencée'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de commencer la prestation'
    })
  }
}

const accepterDemande = async (idDemande) => {
  try {
    await api.put(`/prestataires/demandes/${idDemande}/accepter`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Demande acceptée',
      message: 'La demande a été acceptée avec succès'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible d\'accepter la demande'
    })
  }
}

const refuserDemande = async (idDemande) => {
  if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) return
  
  try {
    await api.put(`/prestataires/demandes/${idDemande}/refuser`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Demande refusée',
      message: 'La demande a été refusée'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de refuser la demande'
    })
  }
}

const toggleServiceStatut = async (idService, statutActuel) => {
  const nouveauStatut = statutActuel === 'actif' ? 'inactif' : 'actif'
  
  try {
    await api.put(`/prestataires/services/${idService}/statut`, {
      statut: nouveauStatut
    })
    
    appStore.addNotification({
      type: 'success',
      title: 'Service mis à jour',
      message: `Le service a été ${nouveauStatut === 'actif' ? 'activé' : 'désactivé'}`
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de modifier le statut du service'
    })
  }
}

onMounted(() => {
  chargerDonnees()
})
</script>