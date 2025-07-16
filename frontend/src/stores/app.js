import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarOpen = ref(false)
  const loading = ref(false)
  const notifications = ref([])
  const theme = ref('light')

  // Actions
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(isOpen) {
    sidebarOpen.value = isOpen
  }

  function setLoading(isLoading) {
    loading.value = isLoading
  }

  function addNotification(notification) {
    const id = Date.now()
    notifications.value.push({
      id,
      type: 'info',
      duration: 5000,
      ...notification
    })

    // Auto-supprimer après la durée spécifiée
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }

    return id
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  // Initialiser le thème depuis localStorage
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.value = savedTheme
    }
  }

  return {
    // State
    sidebarOpen,
    loading,
    notifications,
    theme,

    // Actions
    toggleSidebar,
    setSidebarOpen,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    setTheme,
    initializeTheme
  }
})