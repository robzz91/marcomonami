<template>
  <div 
    class="fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out"
    :class="[
      appStore.sidebarOpen ? 'w-64' : 'w-16',
      'bg-white border-r border-gray-200 shadow-sm'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 border-b border-gray-200">
      <router-link 
        to="/" 
        class="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
        title="Retour au menu principal"
      >
        <img 
          src="/logo-v3.png" 
          alt="EcoDeli" 
          class="h-8 w-8 transition-all duration-300"
        />
        <span 
          v-show="appStore.sidebarOpen"
          class="text-xl font-bold text-gray-900 transition-opacity duration-300"
        >
          EcoDeli
        </span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="mt-8 px-3">
      <div class="space-y-2">
        <!-- Navigation selon le rôle -->
        <template v-if="authStore.userRole === 'livreur'">
          <SidebarLink
            to="/app/livreur"
            :icon="HomeIcon"
            text="Tableau de bord"
          />
          <SidebarLink
            to="/app/livreur/livraisons"
            :icon="TruckIcon"
            text="Mes livraisons"
          />
          <SidebarLink
            to="/app/livreur/portefeuille"
            :icon="CurrencyEuroIcon"
            text="Portefeuille"
          />
        </template>

        <template v-else-if="authStore.userRole === 'commercant'">
          <SidebarLink
            to="/app/commercant"
            :icon="HomeIcon"
            text="Tableau de bord"
          />
          <SidebarLink
            to="/app/commercant/contrats"
            :icon="DocumentTextIcon"
            text="Contrats"
          />
          <SidebarLink
            to="/app/commercant/factures"
            :icon="ReceiptPercentIcon"
            text="Factures"
          />
        </template>

        <template v-else-if="authStore.userRole === 'client'">
          <SidebarLink
            to="/app/client"
            :icon="HomeIcon"
            text="Tableau de bord"
          />
          <SidebarLink
            to="/app/client/services"
            :icon="WrenchScrewdriverIcon"
            text="Services"
          />
          <SidebarLink
            to="/app/client/livraisons"
            :icon="TruckIcon"
            text="Mes livraisons"
          />
          <SidebarLink
            to="/app/client/annonces"
            :icon="MegaphoneIcon"
            text="Mes annonces"
          />
        </template>

        <template v-else-if="authStore.userRole === 'prestataire'">
          <SidebarLink
            to="/app/prestataire"
            :icon="HomeIcon"
            text="Tableau de bord"
          />
          <SidebarLink
            to="/app/prestataire/prestations"
            :icon="BriefcaseIcon"
            text="Prestations"
          />
          <SidebarLink
            to="/app/prestataire/disponibilites"
            :icon="CalendarIcon"
            text="Disponibilités"
          />
          <SidebarLink
            to="/app/prestataire/evaluations"
            :icon="StarIcon"
            text="Évaluations"
          />
        </template>


        <!-- Navigation commune -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <SidebarLink
            to="/app/messages"
            :icon="ChatBubbleLeftRightIcon"
            text="Messages"
          />
          <SidebarLink
            to="/app/annonces"
            :icon="MegaphoneIcon"
            text="Annonces"
          />
        </div>
      </div>
    </nav>

    <!-- User section -->
    <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
      <SidebarLink
        to="/app/profile"
        :icon="UserIcon"
        text="Mon profil"
      />
    </div>

    <!-- Toggle button -->
    <button
      @click="appStore.toggleSidebar"
      class="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow duration-200 hidden lg:block"
    >
      <ChevronLeftIcon 
        class="h-4 w-4 text-gray-600 transition-transform duration-300"
        :class="{ 'rotate-180': !appStore.sidebarOpen }"
      />
    </button>
  </div>

  <!-- Mobile overlay -->
  <div
    v-if="appStore.sidebarOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    @click="appStore.setSidebarOpen(false)"
  />
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import SidebarLink from './SidebarLink.vue'

// Heroicons
import {
  HomeIcon,
  MapIcon,
  TruckIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  CalendarIcon,
  StarIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  UserIcon,
  ChevronLeftIcon
} from '@heroicons/vue/24/outline'

const appStore = useAppStore()
const authStore = useAuthStore()
</script>