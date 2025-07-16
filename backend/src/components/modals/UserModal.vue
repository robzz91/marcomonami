<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
                </h3>
                
                <div class="mt-4 space-y-4">
                  <!-- Nom et Prénom -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="nom" class="label-field">Nom</label>
                      <input
                        id="nom"
                        type="text"
                        required
                        v-model="form.nom"
                        class="input-field"
                        :class="{ 'border-red-500': errors.nom }"
                      />
                      <p v-if="errors.nom" class="mt-1 text-sm text-red-600">{{ errors.nom }}</p>
                    </div>
                    
                    <div>
                      <label for="prenom" class="label-field">Prénom</label>
                      <input
                        id="prenom"
                        type="text"
                        required
                        v-model="form.prenom"
                        class="input-field"
                        :class="{ 'border-red-500': errors.prenom }"
                      />
                      <p v-if="errors.prenom" class="mt-1 text-sm text-red-600">{{ errors.prenom }}</p>
                    </div>
                  </div>

                  <!-- Email -->
                  <div>
                    <label for="email" class="label-field">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      v-model="form.email"
                      class="input-field"
                      :class="{ 'border-red-500': errors.email }"
                    />
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                  </div>

                  <!-- Téléphone -->
                  <div>
                    <label for="telephone" class="label-field">Téléphone</label>
                    <input
                      id="telephone"
                      type="tel"
                      v-model="form.telephone"
                      class="input-field"
                      :class="{ 'border-red-500': errors.telephone }"
                    />
                    <p v-if="errors.telephone" class="mt-1 text-sm text-red-600">{{ errors.telephone }}</p>
                  </div>

                  <!-- Rôle -->
                  <div>
                    <label for="role" class="label-field">Rôle</label>
                    <select
                      id="role"
                      required
                      v-model="form.role"
                      class="input-field"
                      :class="{ 'border-red-500': errors.role }"
                    >
                      <option value="">Sélectionnez un rôle</option>
                      <option value="client">Client</option>
                      <option value="livreur">Livreur</option>
                      <option value="commercant">Commerçant</option>
                      <option value="prestataire">Prestataire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
                  </div>

                  <!-- Mot de passe (uniquement en création) -->
                  <div v-if="!isEditing">
                    <label for="password" class="label-field">Mot de passe</label>
                    <input
                      id="password"
                      type="password"
                      required
                      v-model="form.password"
                      class="input-field"
                      :class="{ 'border-red-500': errors.password }"
                    />
                    <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                  </div>

                  <!-- Statut (uniquement en modification) -->
                  <div v-if="isEditing">
                    <label for="statut" class="label-field">Statut</label>
                    <select
                      id="statut"
                      v-model="form.statut"
                      class="input-field"
                    >
                      <option value="actif">Actif</option>
                      <option value="banni">Banni</option>
                    </select>
                  </div>
                </div>

                <!-- Erreur générale -->
                <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
                  <div class="text-sm text-red-700">{{ error }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <span v-if="loading" class="spinner mr-2"></span>
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import api from '@/services/api'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const notificationStore = useNotificationStore()

// State
const loading = ref(false)
const error = ref('')
const errors = ref({})

const form = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  role: '',
  password: '',
  statut: 'actif'
})

// Watchers
watch(() => props.user, (newUser) => {
  if (newUser) {
    Object.assign(form, {
      nom: newUser.nom || '',
      prenom: newUser.prenom || '',
      email: newUser.email || '',
      telephone: newUser.telephone || '',
      role: newUser.role || '',
      statut: newUser.status || 'actif'
    })
  }
}, { immediate: true })

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!form.nom || form.nom.length < 2) {
    errors.value.nom = 'Le nom doit contenir au moins 2 caractères'
  }
  
  if (!form.prenom || form.prenom.length < 2) {
    errors.value.prenom = 'Le prénom doit contenir au moins 2 caractères'
  }
  
  if (!form.email) {
    errors.value.email = 'L\'email est requis'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'L\'email n\'est pas valide'
  }
  
  if (form.telephone && !/^[0-9+\-\s\(\)]+$/.test(form.telephone)) {
    errors.value.telephone = 'Le format du téléphone n\'est pas valide'
  }
  
  if (!form.role) {
    errors.value.role = 'Le rôle est requis'
  }
  
  if (!props.isEditing && (!form.password || form.password.length < 6)) {
    errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  error.value = ''
  
  try {
    const userData = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      role: form.role
    }
    
    if (props.isEditing) {
      userData.statut = form.statut
      await api.put(`/admin/utilisateurs/${props.user.id}`, userData)
      
      notificationStore.addNotification({
        type: 'success',
        title: 'Utilisateur modifié',
        message: `${form.prenom} ${form.nom} a été modifié avec succès`
      })
    } else {
      userData.mot_de_passe = form.password
      await api.post('/admin/utilisateurs', userData)
      
      notificationStore.addNotification({
        type: 'success',
        title: 'Utilisateur créé',
        message: `${form.prenom} ${form.nom} a été créé avec succès`
      })
    }
    
    emit('saved')
    
  } catch (err) {
    console.error('Erreur:', err)
    error.value = err.response?.data?.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>