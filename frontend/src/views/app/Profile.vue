<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">Mon profil</h1>
      <p class="text-gray-600">Gérez vos informations personnelles et paramètres de compte</p>
    </div>

    <!-- Informations personnelles -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Informations personnelles</h2>
      </div>
      <form @submit.prevent="sauvegarderProfil" class="p-6 space-y-6">
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <!-- Photo de profil -->
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Photo de profil</label>
            <div class="mt-1 flex items-center space-x-5">
              <div class="flex-shrink-0">
                <img 
                  v-if="profil.photo_url" 
                  :src="profil.photo_url" 
                  :alt="`Photo de ${profil.prenom}`"
                  class="h-20 w-20 rounded-full object-cover"
                />
                <div v-else class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon class="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="changerPhoto"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Changer la photo
                </button>
              </div>
            </div>
          </div>

          <!-- Nom -->
          <div>
            <label for="nom" class="label-field">Nom</label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              v-model="profil.nom"
              class="input-field"
              :class="{ 'border-red-500': errors.nom }"
            />
            <p v-if="errors.nom" class="mt-1 text-sm text-red-600">{{ errors.nom }}</p>
          </div>

          <!-- Prénom -->
          <div>
            <label for="prenom" class="label-field">Prénom</label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              v-model="profil.prenom"
              class="input-field"
              :class="{ 'border-red-500': errors.prenom }"
            />
            <p v-if="errors.prenom" class="mt-1 text-sm text-red-600">{{ errors.prenom }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="label-field">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="profil.email"
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
              name="telephone"
              type="tel"
              v-model="profil.telephone"
              class="input-field"
              :class="{ 'border-red-500': errors.telephone }"
            />
            <p v-if="errors.telephone" class="mt-1 text-sm text-red-600">{{ errors.telephone }}</p>
          </div>

          <!-- Adresse -->
          <div class="sm:col-span-2">
            <label for="adresse" class="label-field">Adresse</label>
            <input
              id="adresse"
              name="adresse"
              type="text"
              v-model="profil.adresse"
              class="input-field"
              :class="{ 'border-red-500': errors.adresse }"
            />
            <p v-if="errors.adresse" class="mt-1 text-sm text-red-600">{{ errors.adresse }}</p>
          </div>

          <!-- Date de naissance -->
          <div>
            <label for="dateNaissance" class="label-field">Date de naissance</label>
            <input
              id="dateNaissance"
              name="dateNaissance"
              type="date"
              v-model="profil.date_naissance"
              class="input-field"
            />
          </div>

          <!-- Rôle (lecture seule) -->
          <div>
            <label for="role" class="label-field">Rôle</label>
            <input
              id="role"
              name="role"
              type="text"
              :value="profil.role"
              readonly
              class="input-field bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="annulerModifications"
            class="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary"
          >
            <span v-if="loading" class="spinner mr-2"></span>
            Sauvegarder
          </button>
        </div>
      </form>
    </div>

    <!-- Changement de mot de passe -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Changer le mot de passe</h2>
      </div>
      <form @submit.prevent="changerMotDePasse" class="p-6 space-y-6">
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <!-- Mot de passe actuel -->
          <div class="sm:col-span-2">
            <label for="motDePasseActuel" class="label-field">Mot de passe actuel</label>
            <div class="relative">
              <input
                id="motDePasseActuel"
                name="motDePasseActuel"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                v-model="motDePasse.actuel"
                class="input-field pr-10"
                :class="{ 'border-red-500': errors.motDePasseActuel }"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.motDePasseActuel" class="mt-1 text-sm text-red-600">{{ errors.motDePasseActuel }}</p>
          </div>

          <!-- Nouveau mot de passe -->
          <div>
            <label for="nouveauMotDePasse" class="label-field">Nouveau mot de passe</label>
            <div class="relative">
              <input
                id="nouveauMotDePasse"
                name="nouveauMotDePasse"
                :type="showNewPassword ? 'text' : 'password'"
                required
                v-model="motDePasse.nouveau"
                class="input-field pr-10"
                :class="{ 'border-red-500': errors.nouveauMotDePasse }"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showNewPassword = !showNewPassword"
              >
                <EyeIcon v-if="!showNewPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.nouveauMotDePasse" class="mt-1 text-sm text-red-600">{{ errors.nouveauMotDePasse }}</p>
          </div>

          <!-- Confirmation nouveau mot de passe -->
          <div>
            <label for="confirmationMotDePasse" class="label-field">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmationMotDePasse"
              name="confirmationMotDePasse"
              type="password"
              required
              v-model="motDePasse.confirmation"
              class="input-field"
              :class="{ 'border-red-500': errors.confirmationMotDePasse }"
            />
            <p v-if="errors.confirmationMotDePasse" class="mt-1 text-sm text-red-600">{{ errors.confirmationMotDePasse }}</p>
          </div>
        </div>

        <!-- Bouton de changement -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loadingPassword"
            class="btn-primary"
          >
            <span v-if="loadingPassword" class="spinner mr-2"></span>
            Changer le mot de passe
          </button>
        </div>
      </form>
    </div>

    <!-- Préférences de notification -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Préférences de notification</h2>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-900">Notifications par email</label>
              <p class="text-sm text-gray-500">Recevoir des notifications importantes par email</p>
            </div>
            <input
              type="checkbox"
              v-model="preferences.emailNotifications"
              @change="sauvegarderPreferences"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-900">Notifications push</label>
              <p class="text-sm text-gray-500">Recevoir des notifications sur votre navigateur</p>
            </div>
            <input
              type="checkbox"
              v-model="preferences.pushNotifications"
              @change="sauvegarderPreferences"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-900">Newsletter</label>
              <p class="text-sm text-gray-500">Recevoir la newsletter mensuelle d'EcoDeli</p>
            </div>
            <input
              type="checkbox"
              v-model="preferences.newsletter"
              @change="sauvegarderPreferences"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Suppression du compte -->
    <div class="bg-white shadow rounded-lg border-l-4 border-red-400">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-red-900">Zone de danger</h2>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-red-900">Supprimer mon compte</h3>
            <p class="text-sm text-red-700">Une fois supprimé, votre compte ne pourra pas être récupéré.</p>
          </div>
          <button
            @click="confirmerSuppressionCompte"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import api from '@/services/api'
import { UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const appStore = useAppStore()

// État
const loading = ref(false)
const loadingPassword = ref(false)
const errors = ref({})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const profil = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  date_naissance: '',
  role: '',
  photo_url: ''
})

const profilOriginal = ref({})

const motDePasse = reactive({
  actuel: '',
  nouveau: '',
  confirmation: ''
})

const preferences = reactive({
  emailNotifications: true,
  pushNotifications: false,
  newsletter: true
})

// Méthodes
const chargerProfil = async () => {
  try {
    const response = await api.get('/auth/profil')
    Object.assign(profil, response.data)
    profilOriginal.value = { ...response.data }
    
    // Charger les préférences
    const prefsResponse = await api.get('/auth/preferences')
    Object.assign(preferences, prefsResponse.data)
    
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger le profil'
    })
  }
}

const validerProfil = () => {
  errors.value = {}
  
  if (!profil.nom || profil.nom.length < 2) {
    errors.value.nom = 'Le nom doit contenir au moins 2 caractères'
  }
  
  if (!profil.prenom || profil.prenom.length < 2) {
    errors.value.prenom = 'Le prénom doit contenir au moins 2 caractères'
  }
  
  if (!profil.email) {
    errors.value.email = 'L\'email est requis'
  } else if (!/\S+@\S+\.\S+/.test(profil.email)) {
    errors.value.email = 'L\'email n\'est pas valide'
  }
  
  if (profil.telephone && !/^[0-9+\-\s\(\)]+$/.test(profil.telephone)) {
    errors.value.telephone = 'Le format du téléphone n\'est pas valide'
  }
  
  return Object.keys(errors.value).length === 0
}

const sauvegarderProfil = async () => {
  if (!validerProfil()) return
  
  try {
    loading.value = true
    
    await api.put('/auth/profil', profil)
    
    // Mettre à jour le store d'authentification
    authStore.updateUserInfo(profil)
    
    appStore.addNotification({
      type: 'success',
      title: 'Profil mis à jour',
      message: 'Vos informations ont été sauvegardées avec succès'
    })
    
    profilOriginal.value = { ...profil }
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de sauvegarder le profil'
    })
  } finally {
    loading.value = false
  }
}

const annulerModifications = () => {
  Object.assign(profil, profilOriginal.value)
  errors.value = {}
}

const validerMotDePasse = () => {
  errors.value = {}
  
  if (!motDePasse.actuel) {
    errors.value.motDePasseActuel = 'Le mot de passe actuel est requis'
  }
  
  if (!motDePasse.nouveau) {
    errors.value.nouveauMotDePasse = 'Le nouveau mot de passe est requis'
  } else if (motDePasse.nouveau.length < 8) {
    errors.value.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 8 caractères'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(motDePasse.nouveau)) {
    errors.value.nouveauMotDePasse = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
  }
  
  if (!motDePasse.confirmation) {
    errors.value.confirmationMotDePasse = 'La confirmation est requise'
  } else if (motDePasse.nouveau !== motDePasse.confirmation) {
    errors.value.confirmationMotDePasse = 'Les mots de passe ne correspondent pas'
  }
  
  return Object.keys(errors.value).length === 0
}

const changerMotDePasse = async () => {
  if (!validerMotDePasse()) return
  
  try {
    loadingPassword.value = true
    
    await api.put('/auth/mot-de-passe', {
      ancien_mot_de_passe: motDePasse.actuel,
      nouveau_mot_de_passe: motDePasse.nouveau
    })
    
    appStore.addNotification({
      type: 'success',
      title: 'Mot de passe modifié',
      message: 'Votre mot de passe a été changé avec succès'
    })
    
    // Réinitialiser le formulaire
    motDePasse.actuel = ''
    motDePasse.nouveau = ''
    motDePasse.confirmation = ''
    
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: error.response?.data?.message || 'Impossible de changer le mot de passe'
    })
  } finally {
    loadingPassword.value = false
  }
}

const changerPhoto = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validation du fichier
  if (!file.type.startsWith('image/')) {
    appStore.addNotification({
      type: 'error',
      title: 'Fichier invalide',
      message: 'Veuillez sélectionner une image'
    })
    return
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    appStore.addNotification({
      type: 'error',
      title: 'Fichier trop volumineux',
      message: 'L\'image ne doit pas dépasser 5MB'
    })
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await api.post('/auth/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    profil.photo_url = response.data.photo_url
    
    appStore.addNotification({
      type: 'success',
      title: 'Photo mise à jour',
      message: 'Votre photo de profil a été changée'
    })
    
  } catch (error) {
    console.error('Erreur lors du changement de photo:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de changer la photo'
    })
  }
}

const sauvegarderPreferences = async () => {
  try {
    await api.put('/auth/preferences', preferences)
    
    appStore.addNotification({
      type: 'success',
      title: 'Préférences mises à jour',
      message: 'Vos préférences ont été sauvegardées'
    })
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de sauvegarder les préférences'
    })
  }
}

const confirmerSuppressionCompte = () => {
  if (confirm('Êtes-vous vraiment sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
    if (confirm('Dernière confirmation : voulez-vous vraiment supprimer définitivement votre compte ?')) {
      supprimerCompte()
    }
  }
}

const supprimerCompte = async () => {
  try {
    await api.delete('/auth/compte')
    
    appStore.addNotification({
      type: 'success',
      title: 'Compte supprimé',
      message: 'Votre compte a été supprimé avec succès'
    })
    
    // Déconnexion
    await authStore.logout()
    
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    appStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de supprimer le compte'
    })
  }
}

onMounted(() => {
  chargerProfil()
})
</script>