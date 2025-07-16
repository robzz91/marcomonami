<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-green-100">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-sm border-b border-green-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <img src="/logo-v3.png" alt="EcoDeli" class="h-10 w-10" />
            <span class="ml-3 text-2xl font-bold text-gray-900">EcoDeli</span>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <span class="text-gray-700 text-sm">
                Bonjour, {{ authStore.user?.prenom }}
              </span>
              <router-link
                :to="dashboardPath"
                class="btn-primary"
              >
                Mon tableau de bord
              </router-link>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Connexion
              </router-link>
              <router-link
                to="/register"
                class="btn-primary"
              >
                S'inscrire
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span class="block">Livraison écologique</span>
            <span class="block text-primary-600">pour un avenir durable</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            EcoDeli rassemble livreurs, commerçants, clients et prestataires dans une plateforme unique 
            dédiée au transport écologique et aux services durables.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <template v-if="authStore.isAuthenticated">
              <div class="rounded-md shadow">
                <router-link
                  :to="dashboardPath"
                  class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Accéder à mon espace
                </router-link>
              </div>
            </template>
            <template v-else>
              <div class="rounded-md shadow">
                <router-link
                  to="/register"
                  class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Commencer maintenant
                </router-link>
              </div>
              <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="#features"
                  class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  En savoir plus
                </a>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">
            5 espaces, une plateforme
          </h2>
          <p class="mt-4 text-lg text-gray-600">
            Chaque utilisateur dispose d'un espace dédié avec des fonctionnalités adaptées
          </p>
        </div>

        <div class="mt-16">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Livreurs -->
            <div class="card text-center">
              <div class="flex justify-center">
                <TruckIcon class="h-12 w-12 text-primary-600" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Livreurs</h3>
              <p class="mt-2 text-gray-600">
                Gérez vos trajets, livraisons et revenus. Transport écologique et flexible.
              </p>
            </div>

            <!-- Commerçants -->
            <div class="card text-center">
              <div class="flex justify-center">
                <BuildingStorefrontIcon class="h-12 w-12 text-primary-600" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Commerçants</h3>
              <p class="mt-2 text-gray-600">
                Gérez vos contrats, annonces et facturation. Solution complète pour votre business.
              </p>
            </div>

            <!-- Clients -->
            <div class="card text-center">
              <div class="flex justify-center">
                <UserIcon class="h-12 w-12 text-primary-600" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Clients</h3>
              <p class="mt-2 text-gray-600">
                Réservez des services, créez des annonces. Interface simple et intuitive.
              </p>
            </div>

            <!-- Prestataires -->
            <div class="card text-center">
              <div class="flex justify-center">
                <WrenchScrewdriverIcon class="h-12 w-12 text-primary-600" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Prestataires</h3>
              <p class="mt-2 text-gray-600">
                Gérez vos prestations, disponibilités et évaluations. Développez votre activité.
              </p>
            </div>

            <!-- Administration -->
            <div class="card text-center">
              <div class="flex justify-center">
                <CogIcon class="h-12 w-12 text-primary-600" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Administration</h3>
              <p class="mt-2 text-gray-600">
                Back office complet. Gestion, validation, rapports et modération.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary-600">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span class="block">Prêt à commencer ?</span>
          <span class="block text-primary-200">Rejoignez EcoDeli dès aujourd'hui.</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link
              v-if="authStore.isAuthenticated"
              :to="dashboardPath"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
            >
              Accéder à mon espace
            </router-link>
            <router-link
              v-else
              to="/register"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
            >
              Créer un compte
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img src="/logo-v3.png" alt="EcoDeli" class="h-8 w-8" />
            <span class="ml-3 text-white font-bold">EcoDeli</span>
          </div>
          <p class="text-gray-400 text-sm">
            © 2024 EcoDeli. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  TruckIcon,
  BuildingStorefrontIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const dashboardPath = computed(() => {
  if (authStore.isAuthenticated && authStore.user?.roles?.[0]) {
    return `/app/${authStore.user.roles[0]}`
  }
  return '/app/dashboard'
})
</script>