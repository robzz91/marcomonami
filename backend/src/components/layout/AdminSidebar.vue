<template>
  <div class="admin-sidebar">
    <!-- Logo -->
    <div class="flex items-center flex-shrink-0 px-4 py-6">
      <img class="h-10 w-10" src="/logo-v3.png" alt="EcoDeli Admin" />
      <h1 class="ml-3 text-xl font-bold text-white">EcoDeli Admin</h1>
    </div>
    
    <!-- Navigation -->
    <nav class="mt-8 px-4">
      <div class="space-y-1">
        <!-- Dashboard -->
        <router-link
          to="/"
          class="nav-item group"
          :class="{ 'nav-item-active': $route.name === 'Dashboard' }"
        >
          <HomeIcon class="nav-icon" />
          <span>Tableau de bord</span>
        </router-link>
        
        <!-- Gestion des utilisateurs -->
        <div class="nav-section">
          <div class="nav-section-title">
            <UsersIcon class="nav-icon" />
            <span>Utilisateurs</span>
          </div>
          <div class="nav-subsection">
            <router-link
              to="/users"
              class="nav-subitem group"
              :class="{ 'nav-subitem-active': $route.name === 'UsersManagement' }"
            >
              Gestion des utilisateurs
            </router-link>
          </div>
        </div>
        
        <!-- Modération -->
        <router-link
          to="/moderation"
          class="nav-item group"
          :class="{ 'nav-item-active': $route.name === 'Moderation' }"
        >
          <ShieldCheckIcon class="nav-icon" />
          <span>Modération</span>
        </router-link>
        
        <!-- Contenu -->
        <div class="nav-section">
          <div class="nav-section-title">
            <DocumentTextIcon class="nav-icon" />
            <span>Contenu</span>
          </div>
          <div class="nav-subsection">
            <router-link
              to="/announcements"
              class="nav-subitem group"
              :class="{ 'nav-subitem-active': $route.name === 'Announcements' }"
            >
              Annonces
            </router-link>
            <router-link
              to="/services"
              class="nav-subitem group"
              :class="{ 'nav-subitem-active': $route.name === 'Services' }"
            >
              Services
            </router-link>
          </div>
        </div>
        
        <!-- Opérations -->
        <div class="nav-section">
          <div class="nav-section-title">
            <TruckIcon class="nav-icon" />
            <span>Opérations</span>
          </div>
          <div class="nav-subsection">
            <router-link
              to="/deliveries"
              class="nav-subitem group"
              :class="{ 'nav-subitem-active': $route.name === 'Deliveries' }"
            >
              Livraisons
            </router-link>
          </div>
        </div>
        
        <!-- Finances -->
        <router-link
          to="/finances"
          class="nav-item group"
          :class="{ 'nav-item-active': $route.name === 'Finances' }"
        >
          <CurrencyEuroIcon class="nav-icon" />
          <span>Finances</span>
        </router-link>
        
        <!-- Rapports -->
        <router-link
          to="/reports"
          class="nav-item group"
          :class="{ 'nav-item-active': $route.name === 'Reports' }"
        >
          <ChartBarIcon class="nav-icon" />
          <span>Rapports</span>
        </router-link>
        
        <!-- Paramètres -->
        <router-link
          to="/settings"
          class="nav-item group"
          :class="{ 'nav-item-active': $route.name === 'Settings' }"
        >
          <CogIcon class="nav-icon" />
          <span>Paramètres</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TruckIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-3 py-2 text-sm font-medium rounded-md text-admin-300 hover:text-white hover:bg-admin-700 transition-colors duration-200;
}

.nav-item-active {
  @apply bg-admin-900 text-white;
}

.nav-icon {
  @apply flex-shrink-0 h-5 w-5 mr-3;
}

.nav-section {
  @apply mt-6;
}

.nav-section-title {
  @apply flex items-center px-3 py-2 text-xs font-semibold text-admin-400 uppercase tracking-wider;
}

.nav-subsection {
  @apply mt-1 space-y-1;
}

.nav-subitem {
  @apply flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-md text-admin-300 hover:text-white hover:bg-admin-700 transition-colors duration-200;
}

.nav-subitem-active {
  @apply bg-admin-700 text-white;
}
</style>