<template>
  <div class="relative">
    <!-- Bouton simple et direct -->
    <button
      @click="handleClick"
      class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 relative"
      style="border: 2px solid red;"
    >
      <span style="font-size: 24px;">🔔</span>
      <span 
        v-if="count > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ count }}
      </span>
    </button>

    <!-- Dropdown simple -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200"
      style="z-index: 9999;"
    >
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold">Notifications de test</h3>
      </div>
      <div class="p-4">
        <p class="text-gray-600">Le centre de notifications fonctionne !</p>
        <p class="text-sm text-gray-500 mt-2">{{ count }} notifications non lues</p>
      </div>
      <div class="p-4 border-t border-gray-200">
        <button 
          @click="isOpen = false"
          class="text-sm text-blue-600 hover:text-blue-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const count = ref(5) // Nombre fixe pour tester

const handleClick = () => {
  console.log('=== SIMPLE NOTIFICATION BUTTON CLICKED ===')
  isOpen.value = !isOpen.value
  console.log('isOpen:', isOpen.value)
}
</script>