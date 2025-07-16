<template>
  <div class="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-2 max-w-sm sm:max-w-md sm:w-auto">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in appStore.notifications"
        :key="notification.id"
        class="w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <component 
                :is="getIcon(notification.type)"
                class="h-5 w-5"
                :class="getIconColor(notification.type)"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p 
                v-if="notification.title"
                class="text-sm font-semibold text-gray-900 leading-5 break-words"
              >
                {{ notification.title }}
              </p>
              <p 
                class="text-sm text-gray-600 leading-5 break-words"
                :class="notification.title ? 'mt-1' : ''"
              >
                {{ notification.message }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <button
                @click="appStore.removeNotification(notification.id)"
                class="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <span class="sr-only">Fermer</span>
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress bar pour les notifications temporaires -->
        <div 
          v-if="notification.duration > 0"
          class="h-1 bg-gray-100"
        >
          <div 
            class="h-full transition-all ease-linear"
            :class="getProgressColor(notification.type)"
            :style="{ 
              width: '100%', 
              animationDuration: `${notification.duration}ms`,
              animation: 'shrink-width linear forwards'
            }"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

// Heroicons
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const appStore = useAppStore()

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'error':
      return XCircleIcon
    case 'info':
    default:
      return InformationCircleIcon
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-400'
    case 'warning':
      return 'text-yellow-400'
    case 'error':
      return 'text-red-400'
    case 'info':
    default:
      return 'text-blue-400'
  }
}

const getProgressColor = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-400'
    case 'warning':
      return 'bg-yellow-400'
    case 'error':
      return 'bg-red-400'
    case 'info':
    default:
      return 'bg-blue-400'
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes shrink-width {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>