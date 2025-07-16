<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="flex justify-center">
          <img src="/logo-v3.png" alt="EcoDeli" class="h-16 w-16" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            connectez-vous à votre compte existant
          </router-link>
        </p>
      </div>

      <!-- Formulaire -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Nom et Prénom -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="nom" class="label-field">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                v-model="form.nom"
                class="input-field"
                :class="{ 'border-red-500': errors.nom }"
                placeholder="Dupont"
              />
              <p v-if="errors.nom" class="mt-1 text-sm text-red-600">
                {{ errors.nom }}
              </p>
            </div>

            <div>
              <label for="prenom" class="label-field">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                v-model="form.prenom"
                class="input-field"
                :class="{ 'border-red-500': errors.prenom }"
                placeholder="Jean"
              />
              <p v-if="errors.prenom" class="mt-1 text-sm text-red-600">
                {{ errors.prenom }}
              </p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="label-field">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="form.email"
              class="input-field"
              :class="{ 'border-red-500': errors.email }"
              placeholder="jean.dupont@example.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <!-- Téléphone -->
          <div>
            <label for="telephone" class="label-field">
              Téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required
              v-model="form.telephone"
              class="input-field"
              :class="{ 'border-red-500': errors.telephone }"
              placeholder="0123456789"
            />
            <p v-if="errors.telephone" class="mt-1 text-sm text-red-600">
              {{ errors.telephone }}
            </p>
          </div>

          <!-- Adresse -->
          <div>
            <label for="adresse" class="label-field">
              Adresse
            </label>
            <input
              id="adresse"
              name="adresse"
              type="text"
              required
              v-model="form.adresse"
              class="input-field"
              :class="{ 'border-red-500': errors.adresse }"
              placeholder="123 Rue de la Paix, 75001 Paris"
            />
            <p v-if="errors.adresse" class="mt-1 text-sm text-red-600">
              {{ errors.adresse }}
            </p>
          </div>

          <!-- Rôle -->
          <div>
            <label for="role" class="label-field">
              Je souhaite m'inscrire en tant que
            </label>
            <select
              id="role"
              name="role"
              required
              v-model="form.role"
              class="input-field"
              :class="{ 'border-red-500': errors.role }"
            >
              <option value="">Sélectionnez votre rôle</option>
              <option value="client">Client - Je veux faire livrer ou utiliser des services</option>
              <option value="livreur">Livreur - Je veux effectuer des livraisons</option>
              <option value="commercant">Commerçant - Je veux proposer mes produits</option>
              <option value="prestataire">Prestataire - Je veux proposer mes services</option>
            </select>
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">
              {{ errors.role }}
            </p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="label-field">
              Mot de passe
            </label>
            <div class="relative">
              <input
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                v-model="form.password"
                class="input-field pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
            <div class="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.
            </div>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label for="confirmPassword" class="label-field">
              Confirmer le mot de passe
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                v-model="form.confirmPassword"
                class="input-field pr-10"
                :class="{ 'border-red-500': errors.confirmPassword }"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <!-- Conditions d'utilisation -->
        <div class="flex items-center">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            v-model="form.acceptTerms"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="acceptTerms" class="ml-2 block text-sm text-gray-900">
            J'accepte les 
            <a href="#" class="text-primary-600 hover:text-primary-500">conditions d'utilisation</a>
            et la 
            <a href="#" class="text-primary-600 hover:text-primary-500">politique de confidentialité</a>
          </label>
        </div>

        <!-- Erreur générale -->
        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur lors de l'inscription
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ authStore.error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton d'inscription -->
        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="spinner mr-2"></span>
            Créer mon compte
          </button>
        </div>

        <!-- Lien vers la connexion -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Déjà un compte ?
            <router-link
              to="/login"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Connectez-vous
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// State
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref({})

const form = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  role: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Validation
const validateForm = () => {
  errors.value = {}
  
  // Nom
  if (!form.nom || form.nom.length < 2) {
    errors.value.nom = 'Le nom doit contenir au moins 2 caractères'
  }
  
  // Prénom
  if (!form.prenom || form.prenom.length < 2) {
    errors.value.prenom = 'Le prénom doit contenir au moins 2 caractères'
  }
  
  // Email
  if (!form.email) {
    errors.value.email = 'L\'email est requis'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'L\'email n\'est pas valide'
  }
  
  // Téléphone
  if (!form.telephone) {
    errors.value.telephone = 'Le téléphone est requis'
  } else if (!/^[0-9+\-\s\(\)]+$/.test(form.telephone)) {
    errors.value.telephone = 'Le format du téléphone n\'est pas valide'
  }
  
  // Adresse
  if (!form.adresse || form.adresse.length < 10) {
    errors.value.adresse = 'L\'adresse doit contenir au moins 10 caractères'
  }
  
  // Rôle
  if (!form.role) {
    errors.value.role = 'Le rôle est requis'
  }
  
  // Mot de passe
  if (!form.password) {
    errors.value.password = 'Le mot de passe est requis'
  } else if (form.password.length < 8) {
    errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
    errors.value.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
  }
  
  // Confirmation mot de passe
  if (!form.confirmPassword) {
    errors.value.confirmPassword = 'La confirmation du mot de passe est requise'
  } else if (form.password !== form.confirmPassword) {
    errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
  }
  
  return Object.keys(errors.value).length === 0
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) return
  
  if (!form.acceptTerms) {
    appStore.addNotification({
      type: 'error',
      title: 'Conditions d\'utilisation',
      message: 'Vous devez accepter les conditions d\'utilisation'
    })
    return
  }
  
  authStore.clearError()
  
  const result = await authStore.register({
    nom: form.nom,
    prenom: form.prenom,
    email: form.email,
    telephone: form.telephone,
    adresse: form.adresse,
    role: form.role,
    mot_de_passe: form.password
  })
  
  if (result.success) {
    appStore.addNotification({
      type: 'success',
      title: 'Inscription réussie',
      message: `Bienvenue ${form.prenom} ! Votre compte a été créé avec succès.`
    })
    
    // Rediriger vers l'espace approprié
    router.push(`/app/${form.role}`)
  }
}
</script>