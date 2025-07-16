import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  
  function addNotification({ type = 'info', title, message, duration = 5000 }) {
    const id = Date.now() + Math.random()
    
    const notification = {
      id,
      type,
      title,
      message,
      createdAt: new Date()
    }
    
    notifications.value.push(notification)
    
    // Auto-suppression après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function clearAllNotifications() {
    notifications.value = []
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  }
})