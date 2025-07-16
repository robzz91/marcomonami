<template>
  <router-link
    :to="to"
    class="nav-link group"
    :class="isActive ? 'active' : 'inactive'"
    v-slot="{ isActive: linkActive }"
  >
    <component 
      :is="icon" 
      class="h-5 w-5 flex-shrink-0 transition-colors duration-200"
      :class="linkActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'"
    />
    <span 
      v-show="appStore.sidebarOpen"
      class="ml-3 transition-opacity duration-300 truncate"
      :class="linkActive ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-gray-900'"
    >
      {{ text }}
    </span>
    
    <!-- Indicateur actif pour sidebar réduite -->
    <div
      v-if="linkActive && !appStore.sidebarOpen"
      class="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-lg"
    />
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})

const route = useRoute()
const appStore = useAppStore()

const isActive = computed(() => {
  return route.path === props.to || route.path.startsWith(props.to + '/')
})
</script>