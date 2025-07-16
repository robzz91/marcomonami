<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tableau de bord Livreur</h1>
          <p class="text-gray-600">Bienvenue {{ authStore.userName }}, gérez vos livraisons et trajets</p>
        </div>
        <div class="flex space-x-3">
          <router-link to="/app/livreur/trajets" class="btn-primary">
            Nouveau trajet
          </router-link>
          <router-link to="/app/livreur/profil" class="btn-secondary">
            Mon profil
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
              <TruckIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Livraisons aujourd'hui
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.livraisonsAujourdhui }}
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
              <BanknotesIcon class="h-6 w-6 text-green-600" />
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
              <ClockIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Heures travaillées
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.heuresTravaillees }}h
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

    <!-- Livraisons en cours -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Livraisons en cours</h2>
      </div>
      <div class="p-6">
        <div v-if="livraisonsEnCours.length === 0" class="text-center py-8">
          <TruckIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune livraison en cours</h3>
          <p class="mt-1 text-sm text-gray-500">Commencez par créer un nouveau trajet</p>
          <div class="mt-6">
            <router-link to="/app/livreur/trajets" class="btn-primary">
              Créer un trajet
            </router-link>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="livraison in livraisonsEnCours" 
            :key="livraison.id_livraison"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <span class="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></span>
                  <h3 class="text-sm font-medium text-gray-900">
                    Livraison #{{ livraison.id_livraison }}
                  </h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {{ livraison.statut }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  De {{ livraison.adresse_collecte }} vers {{ livraison.adresse_livraison }}
                </p>
                <p class="text-xs text-gray-500">
                  Heure prévue: {{ formatTime(livraison.heure_livraison_prevue) }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="marquerLivree(livraison.id_livraison)"
                  class="btn-primary btn-sm"
                >
                  Marquer livrée
                </button>
                <router-link 
                  :to="`/app/livreur/livraisons/${livraison.id_livraison}`"
                  class="btn-secondary btn-sm"
                >
                  Détails
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trajet actuel -->
    <div v-if="trajetActuel" class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Trajet en cours</h2>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ trajetActuel.ville_depart }} → {{ trajetActuel.ville_arrivee }}
            </h3>
            <p class="text-sm text-gray-600">
              Départ: {{ formatDateTime(trajetActuel.heure_depart) }}
            </p>
            <p class="text-sm text-gray-600">
              Places disponibles: {{ trajetActuel.places_disponibles }}
            </p>
          </div>
          <div class="flex space-x-3">
            <router-link 
              :to="`/app/livreur/trajets/${trajetActuel.id_trajet}`"
              class="btn-secondary"
            >
              Gérer le trajet
            </router-link>
            <button 
              @click="terminerTrajet"
              class="btn-primary"
            >
              Terminer le trajet
            </button>
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
            to="/app/livreur/trajets"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <PlusIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Nouveau trajet</span>
          </router-link>
          
          <router-link 
            to="/app/livreur/livraisons"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ListBulletIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Mes livraisons</span>
          </router-link>
          
          <router-link 
            to="/app/livreur/revenus"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChartBarIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Revenus</span>
          </router-link>
          
          <router-link 
            to="/app/livreur/documents"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <DocumentIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Documents</span>
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
  TruckIcon,
  BanknotesIcon,
  ClockIcon,
  StarIcon,
  PlusIcon,
  ListBulletIcon,
  ChartBarIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const appStore = useAppStore()

// État
const stats = ref({
  livraisonsAujourdhui: 0,
  revenusMois: 0,
  heuresTravaillees: 0,
  noteMoyenne: 0
})
const livraisonsEnCours = ref([])
const trajetActuel = ref(null)
const loading = ref(true)

// Méthodes utilitaires
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatTime = (time) => {
  return new Date(time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Actions
const chargerDonnees = async () => {
  try {
    loading.value = true
    
    const [statsRes, livraisonsRes, trajetRes] = await Promise.all([
      api.get('/livreurs/stats'),
      api.get('/livreurs/livraisons/en-cours'),
      api.get('/livreurs/trajet-actuel')
    ])
    
    stats.value = statsRes.data
    livraisonsEnCours.value = livraisonsRes.data
    trajetActuel.value = trajetRes.data
    
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

const marquerLivree = async (idLivraison) => {
  try {
    await api.put(`/livreurs/livraisons/${idLivraison}/livree`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Livraison terminée',
      message: 'La livraison a été marquée comme livrée'
    })
    
    // Recharger les données
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de marquer la livraison comme livrée'
    })
  }
}

const terminerTrajet = async () => {
  if (!confirm('Êtes-vous sûr de vouloir terminer ce trajet ?')) return
  
  try {
    await api.put(`/livreurs/trajets/${trajetActuel.value.id_trajet}/terminer`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Trajet terminé',
      message: 'Le trajet a été terminé avec succès'
    })
    
    // Recharger les données
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de terminer le trajet'
    })
  }
}

onMounted(() => {
  chargerDonnees()
})
</script>