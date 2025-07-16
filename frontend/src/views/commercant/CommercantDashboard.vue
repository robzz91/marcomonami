<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tableau de bord Commerçant</h1>
          <p class="text-gray-600">Bienvenue {{ authStore.userName }}, gérez votre business</p>
        </div>
        <div class="flex space-x-3">
          <router-link to="/app/commercant/annonces/nouvelle" class="btn-primary">
            Nouvelle annonce
          </router-link>
          <router-link to="/app/commercant/contrats" class="btn-secondary">
            Mes contrats
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
              <MegaphoneIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Annonces actives
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.annoncesActives }}
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
              <DocumentTextIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Contrats en cours
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.contratsEnCours }}
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
                  CA mensuel
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ formatCurrency(stats.chiffreAffairesMensuel) }}
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
              <BanknotesIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Factures impayées
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.facturesImpayees }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Annonces récentes -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Mes annonces récentes</h2>
          <router-link to="/app/commercant/annonces" class="text-sm text-primary-600 hover:text-primary-500">
            Voir toutes
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div v-if="annoncesRecentes.length === 0" class="text-center py-8">
          <MegaphoneIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
          <p class="mt-1 text-sm text-gray-500">Commencez par créer votre première annonce</p>
          <div class="mt-6">
            <router-link to="/app/commercant/annonces/nouvelle" class="btn-primary">
              Créer une annonce
            </router-link>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="annonce in annoncesRecentes" 
            :key="annonce.id_annonce"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ annonce.titre }}
                  </h3>
                  <span :class="getStatutClass(annonce.statut)">
                    {{ annonce.statut }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  {{ annonce.description }}
                </p>
                <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>Créée le {{ formatDate(annonce.date_creation) }}</span>
                  <span>{{ annonce.nb_vues }} vues</span>
                  <span>{{ annonce.nb_reponses }} réponses</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <router-link 
                  :to="`/app/commercant/annonces/${annonce.id_annonce}`"
                  class="btn-secondary btn-sm"
                >
                  Modifier
                </router-link>
                <button 
                  @click="archiverAnnonce(annonce.id_annonce)"
                  class="btn-outline btn-sm"
                >
                  Archiver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contrats en attente -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Contrats en attente</h2>
          <router-link to="/app/commercant/contrats" class="text-sm text-primary-600 hover:text-primary-500">
            Voir tous
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div v-if="contratsEnAttente.length === 0" class="text-center py-4">
          <DocumentTextIcon class="mx-auto h-8 w-8 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">Aucun contrat en attente</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="contrat in contratsEnAttente" 
            :key="contrat.id_contrat"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div>
              <h4 class="text-sm font-medium text-gray-900">{{ contrat.nom_client }}</h4>
              <p class="text-xs text-gray-500">{{ contrat.description }}</p>
              <p class="text-xs text-gray-500">Budget: {{ formatCurrency(contrat.budget) }}</p>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="accepterContrat(contrat.id_contrat)"
                class="btn-primary btn-sm"
              >
                Accepter
              </button>
              <button 
                @click="refuserContrat(contrat.id_contrat)"
                class="btn-outline btn-sm"
              >
                Refuser
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
            to="/app/commercant/annonces/nouvelle"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <PlusIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Nouvelle annonce</span>
          </router-link>
          
          <router-link 
            to="/app/commercant/factures"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <DocumentIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Facturation</span>
          </router-link>
          
          <router-link 
            to="/app/commercant/statistiques"
            class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChartBarIcon class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-900">Statistiques</span>
          </router-link>
          
          <router-link 
            to="/app/commercant/profil"
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
  MegaphoneIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  PlusIcon,
  DocumentIcon,
  ChartBarIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const appStore = useAppStore()

// État
const stats = ref({
  annoncesActives: 0,
  contratsEnCours: 0,
  chiffreAffairesMensuel: 0,
  facturesImpayees: 0
})
const annoncesRecentes = ref([])
const contratsEnAttente = ref([])
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

const getStatutClass = (statut) => {
  const classes = {
    'active': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'en_attente': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    'inactive': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    'archivee': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  }
  return classes[statut] || classes['inactive']
}

// Actions
const chargerDonnees = async () => {
  try {
    loading.value = true
    
    const [statsRes, annoncesRes, contratsRes] = await Promise.all([
      api.get('/commercants/stats'),
      api.get('/commercants/annonces?limit=5'),
      api.get('/commercants/contrats/en-attente')
    ])
    
    stats.value = statsRes.data
    annoncesRecentes.value = annoncesRes.data
    contratsEnAttente.value = contratsRes.data
    
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

const archiverAnnonce = async (idAnnonce) => {
  if (!confirm('Êtes-vous sûr de vouloir archiver cette annonce ?')) return
  
  try {
    await api.put(`/commercants/annonces/${idAnnonce}/archiver`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Annonce archivée',
      message: 'L\'annonce a été archivée avec succès'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible d\'archiver l\'annonce'
    })
  }
}

const accepterContrat = async (idContrat) => {
  try {
    await api.put(`/commercants/contrats/${idContrat}/accepter`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Contrat accepté',
      message: 'Le contrat a été accepté avec succès'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible d\'accepter le contrat'
    })
  }
}

const refuserContrat = async (idContrat) => {
  if (!confirm('Êtes-vous sûr de vouloir refuser ce contrat ?')) return
  
  try {
    await api.put(`/commercants/contrats/${idContrat}/refuser`)
    
    appStore.addNotification({
      type: 'success',
      title: 'Contrat refusé',
      message: 'Le contrat a été refusé'
    })
    
    chargerDonnees()
    
  } catch (error) {
    console.error('Erreur:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de refuser le contrat'
    })
  }
}

onMounted(() => {
  chargerDonnees()
})
</script>