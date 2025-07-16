<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="flex justify-center">
          <img src="/logo-v3.png" alt="EcoDeli" class="h-16 w-16" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link
            to="/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            créez un nouveau compte
          </router-link>
        </p>
      </div>

      <!-- Formulaire -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
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
              placeholder="votre@email.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
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
                autocomplete="current-password"
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
          </div>
        </div>

        <!-- Options -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="form.rememberMe"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <a
              href="#"
              class="font-medium text-primary-600 hover:text-primary-500"
              @click.prevent="showForgotPassword = true"
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <!-- Erreur générale -->
        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur de connexion
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ authStore.error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton de connexion -->
        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="spinner mr-2"></span>
            Se connecter
          </button>
        </div>

        <!-- Lien vers l'inscription -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Pas encore de compte ?
            <router-link
              to="/register"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Inscrivez-vous gratuitement
            </router-link>
          </p>
        </div>
      </form>
    </div>

    <!-- Modal mot de passe oublié -->
    <ForgotPasswordModal
      v-if="showForgotPassword"
      @close="showForgotPassword = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// State
const showPassword = ref(false)
const showForgotPassword = ref(false)
const errors = ref({})

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Validation
const validateForm = () => {
  errors.value = {}
  
  if (!form.email) {
    errors.value.email = 'L\'email est requis'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'L\'email n\'est pas valide'
  }
  
  if (!form.password) {
    errors.value.password = 'Le mot de passe est requis'
  } else if (form.password.length < 6) {
    errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères'
  }
  
  return Object.keys(errors.value).length === 0
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) return
  
  authStore.clearError()
  
  const result = await authStore.login({
    email: form.email,
    mot_de_passe: form.password
  })
  
  if (result.success) {
    appStore.addNotification({
      type: 'success',
      title: 'Connexion réussie',
      message: `Bienvenue ${authStore.userName} !`
    })
    
    // Rediriger vers l'espace approprié
    const userRole = authStore.userRole
    if (userRole) {
      router.push(`/app/${userRole}`)
    } else {
      router.push('/app/profile')
    }
  }
}
</script>