<template>
  <div class="space-y-6">
    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="stats-card">
        <div class="stats-card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="stats-icon text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="stats-label">
                  Utilisateurs actifs
                </dt>
                <dd class="stats-value">
                  {{ stats.utilisateursActifs }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TruckIcon class="stats-icon text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="stats-label">
                  Livraisons aujourd'hui
                </dt>
                <dd class="stats-value">
                  {{ stats.livraisonsDuJour }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyEuroIcon class="stats-icon text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="stats-label">
                  CA mensuel
                </dt>
                <dd class="stats-value">
                  {{ formatCurrency(stats.chiffreAffairesMensuel) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="stats-icon text-red-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="stats-label">
                  Signalements
                </dt>
                <dd class="stats-value">
                  {{ stats.signalements }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques et données analytiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Évolution des inscriptions -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Inscriptions (30 derniers jours)</h3>
        </div>
        <div class="card-body">
          <UserRegistrationChart :data="chartData.inscriptions" />
        </div>
      </div>

      <!-- Répartition par rôle -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Répartition des utilisateurs</h3>
        </div>
        <div class="card-body">
          <UserRoleChart :data="chartData.roles" />
        </div>
      </div>
    </div>

    <!-- Actions rapides et éléments en attente -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Éléments en attente de validation -->
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">En attente de validation</h3>
            <span class="badge badge-warning">{{ elementsEnAttente.length }}</span>
          </div>
        </div>
        <div class="card-body">
          <div v-if="elementsEnAttente.length === 0" class="text-center py-8">
            <CheckCircleIcon class="mx-auto h-12 w-12 text-green-400" />
            <p class="mt-2 text-sm text-gray-500">Aucun élément en attente</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="element in elementsEnAttente.slice(0, 5)" 
              :key="`${element.type}-${element.id}`"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span :class="getTypeClass(element.type)">
                    {{ getTypeLabel(element.type) }}
                  </span>
                  <h4 class="text-sm font-medium text-gray-900">{{ element.titre }}</h4>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ element.nom_utilisateur }}</p>
              </div>
              <div class="flex space-x-2">
                <button @click="validerElement(element)" class="btn-primary btn-sm">
                  Valider
                </button>
                <button @click="rejeterElement(element)" class="btn-danger btn-sm">
                  Rejeter
                </button>
              </div>
            </div>
            
            <div v-if="elementsEnAttente.length > 5" class="text-center pt-3">
              <router-link to="/moderation" class="text-primary-600 hover:text-primary-500 text-sm">
                Voir tous ({{ elementsEnAttente.length }})
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Activité récente</h3>
        </div>
        <div class="card-body">
          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in activitesRecentes" :key="activity.id">
                <div class="relative pb-8">
                  <div v-if="index !== activitesRecentes.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                  <div class="relative flex space-x-3">
                    <div>
                      <span :class="getActivityIconClass(activity.type)">
                        <component :is="getActivityIcon(activity.type)" class="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ activity.description }}
                        </p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ formatTimeAgo(activity.date) }}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Actions rapides</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <router-link 
            to="/users"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UsersIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Utilisateurs</span>
          </router-link>
          
          <router-link 
            to="/moderation"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShieldCheckIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Modération</span>
          </router-link>
          
          <router-link 
            to="/announcements"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MegaphoneIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Annonces</span>
          </router-link>
          
          <router-link 
            to="/deliveries"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TruckIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Livraisons</span>
          </router-link>
          
          <router-link 
            to="/reports"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Rapports</span>
          </router-link>
          
          <router-link 
            to="/settings"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CogIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Paramètres</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import api from '@/services/api'
import {
  UsersIcon,
  TruckIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  UserPlusIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import UserRegistrationChart from '@/components/charts/UserRegistrationChart.vue'
import UserRoleChart from '@/components/charts/UserRoleChart.vue'
import { formatTimeAgo } from '@/utils/dateHelper'

const notificationStore = useNotificationStore()

// State
const loading = ref(true)
const stats = ref({
  utilisateursActifs: 0,
  livraisonsDuJour: 0,
  chiffreAffairesMensuel: 0,
  signalements: 0
})

const chartData = ref({
  inscriptions: [],
  roles: []
})

const elementsEnAttente = ref([])
const activitesRecentes = ref([])

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}


const getTypeClass = (type) => {
  const classes = {
    'utilisateur': 'badge badge-info',
    'service': 'badge badge-success',
    'annonce': 'badge badge-warning',
    'signalement': 'badge badge-error'
  }
  return classes[type] || 'badge badge-info'
}

const getTypeLabel = (type) => {
  const labels = {
    'utilisateur': 'Utilisateur',
    'service': 'Service',
    'annonce': 'Annonce',
    'signalement': 'Signalement'
  }
  return labels[type] || type
}

const getActivityIconClass = (type) => {
  const classes = {
    'user_registered': 'h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white',
    'service_created': 'h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white',
    'announcement_created': 'h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white',
    'report_submitted': 'h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white'
  }
  return classes[type] || 'h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center ring-8 ring-white'
}

const getActivityIcon = (type) => {
  const icons = {
    'user_registered': UserPlusIcon,
    'service_created': PlusIcon,
    'announcement_created': MegaphoneIcon,
    'report_submitted': ExclamationTriangleIcon
  }
  return icons[type] || DocumentTextIcon
}

const chargerDonnees = async () => {
  try {
    loading.value = true
    
    const [statsRes, attentesRes, activitesRes, chartsRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/validations/en-attente'),
      api.get('/admin/activites/recentes'),
      api.get('/admin/charts-data')
    ])
    
    stats.value = statsRes.data
    elementsEnAttente.value = attentesRes.data
    activitesRecentes.value = activitesRes.data
    chartData.value = chartsRes.data
    
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger les données du tableau de bord'
    })
  } finally {
    loading.value = false
  }
}

const validerElement = async (element) => {
  try {
    await api.put(`/admin/validations/${element.type}/${element.id}/valider`)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Élément validé',
      message: `${getTypeLabel(element.type)} validé avec succès`
    })
    
    // Recharger les données
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de valider l\'élément'
    })
  }
}

const rejeterElement = async (element) => {
  if (!confirm(`Êtes-vous sûr de vouloir rejeter ce ${getTypeLabel(element.type).toLowerCase()} ?`)) return
  
  try {
    await api.put(`/admin/validations/${element.type}/${element.id}/rejeter`)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Élément rejeté',
      message: `${getTypeLabel(element.type)} rejeté`
    })
    
    // Recharger les données
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de rejeter l\'élément'
    })
  }
}

onMounted(() => {
  chargerDonnees()
})
</script>