<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
        <p class="mt-2 text-sm text-gray-700">
          Gérez tous les utilisateurs de la plateforme EcoDeli
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="showCreateModal = true"
          class="btn-primary"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="card">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Recherche -->
          <div class="md:col-span-2">
            <label for="search" class="label-field">Rechercher</label>
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search"
                v-model="filters.search"
                type="text"
                class="input-field pl-10"
                placeholder="Nom, email, téléphone..."
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Filtre par rôle -->
          <div>
            <label for="role" class="label-field">Rôle</label>
            <select
              id="role"
              v-model="filters.role"
              class="input-field"
              @change="applyFilters"
            >
              <option value="">Tous les rôles</option>
              <option value="client">Client</option>
              <option value="livreur">Livreur</option>
              <option value="commercant">Commerçant</option>
              <option value="prestataire">Prestataire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <!-- Filtre par statut -->
          <div>
            <label for="status" class="label-field">Statut</label>
            <select
              id="status"
              v-model="filters.status"
              class="input-field"
              @change="applyFilters"
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="banni">Banni</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner mx-auto"></div>
          <p class="mt-2 text-sm text-gray-500">Chargement des utilisateurs...</p>
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8">
          <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">Modifiez vos critères de recherche</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table-auto">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">Utilisateur</th>
                <th class="table-header">Rôle</th>
                <th class="table-header">Statut</th>
                <th class="table-header">Inscription</th>
                <th class="table-header">Dernière connexion</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id_utilisateur">
                <td class="table-cell">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img
                        v-if="user.photo_url"
                        :src="user.photo_url"
                        :alt="`Photo de ${user.prenom}`"
                        class="h-10 w-10 rounded-full object-cover"
                      />
                      <div v-else class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ user.prenom?.charAt(0) }}{{ user.nom?.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.prenom }} {{ user.nom }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <span :class="getRoleClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="table-cell">
                  <span :class="getStatusClass(user.status)">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td class="table-cell text-sm text-gray-500">
                  {{ formatDate(user.date_creation) }}
                </td>
                <td class="table-cell text-sm text-gray-500">
                  {{ formatDateOrDefault(user.derniere_connexion, 'Jamais') }}
                </td>
                <td class="table-cell">
                  <div class="flex space-x-2">
                    <button
                      @click="editUser(user)"
                      class="text-yellow-600 hover:text-yellow-900 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="text-red-600 hover:text-red-900 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between pt-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="changePage(pagination.currentPage - 1)"
              :disabled="pagination.currentPage === 1"
              class="btn-secondary"
            >
              Précédent
            </button>
            <button
              @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.totalPages"
              class="btn-secondary"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Affichage de
                <span class="font-medium">{{ (pagination.currentPage - 1) * pagination.perPage + 1 }}</span>
                à
                <span class="font-medium">{{ Math.min(pagination.currentPage * pagination.perPage, pagination.total) }}</span>
                sur
                <span class="font-medium">{{ pagination.total }}</span>
                résultats
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="changePage(pagination.currentPage - 1)"
                  :disabled="pagination.currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    page === pagination.currentPage
                      ? 'bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="changePage(pagination.currentPage + 1)"
                  :disabled="pagination.currentPage === pagination.totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création/modification -->
    <UserModal
      v-if="showCreateModal || showEditModal"
      :user="selectedUser"
      :is-editing="showEditModal"
      @close="closeModals"
      @saved="handleUserSaved"
    />

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteModal = false"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Supprimer l'utilisateur
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer l'utilisateur 
                    <span class="font-semibold">{{ userToDelete?.prenom }} {{ userToDelete?.nom }}</span> ?
                    Cette action est irréversible et supprimera définitivement toutes les données associées.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmDelete"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Supprimer
            </button>
            <button
              type="button"
              @click="showDeleteModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import api from '@/services/api'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import UserModal from '@/components/modals/UserModal.vue'
import { formatDate, formatDateOrDefault } from '@/utils/dateHelper'
import { debounce } from 'lodash'

const notificationStore = useNotificationStore()

// State
const loading = ref(false)
const users = ref([])
const selectedUser = ref(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref(null)

const filters = ref({
  search: '',
  role: '',
  status: ''
})

const pagination = ref({
  currentPage: 1,
  perPage: 20,
  total: 0,
  totalPages: 0
})

// Computed
const visiblePages = computed(() => {
  const pages = []
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods

const getRoleClass = (role) => {
  const classes = {
    'client': 'badge badge-info',
    'livreur': 'badge badge-success',
    'commercant': 'badge badge-warning',
    'prestataire': 'badge',
    'admin': 'badge badge-error'
  }
  return classes[role] || 'badge'
}

const getRoleLabel = (role) => {
  const labels = {
    'client': 'Client',
    'livreur': 'Livreur',
    'commercant': 'Commerçant',
    'prestataire': 'Prestataire',
    'admin': 'Administrateur'
  }
  return labels[role] || role
}

const getStatusClass = (status) => {
  const classes = {
    'actif': 'badge badge-success',
    'banni': 'badge badge-error'
  }
  return classes[status] || 'badge'
}

const getStatusLabel = (status) => {
  const labels = {
    'actif': 'Actif',
    'banni': 'Banni'
  }
  return labels[status] || status
}

const loadUsers = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
      ...filters.value
    }
    
    const response = await api.get('/admin/utilisateurs', { params })
    
    users.value = response.data.data
    pagination.value = {
      ...pagination.value,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger les utilisateurs'
    })
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  loadUsers()
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page
    loadUsers()
  }
}

const editUser = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  try {
    await api.delete(`/admin/utilisateurs/${userToDelete.value.id}`)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Utilisateur supprimé',
      message: `${userToDelete.value.prenom} ${userToDelete.value.nom} a été supprimé`
    })
    
    loadUsers()
    
  } catch (error) {
    console.error('Erreur:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de supprimer l\'utilisateur'
    })
  } finally {
    showDeleteModal.value = false
    userToDelete.value = null
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedUser.value = null
  userToDelete.value = null
}

const handleUserSaved = () => {
  closeModals()
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>