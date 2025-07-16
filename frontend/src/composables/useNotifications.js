import { useAppStore } from '@/stores/app'

export function useNotifications() {
  const appStore = useAppStore()

  const notifySuccess = (title, message) => {
    appStore.addNotification({
      type: 'success',
      title,
      message
    })
  }

  const notifyError = (title, message) => {
    appStore.addNotification({
      type: 'error',
      title,
      message
    })
  }

  const notifyWarning = (title, message) => {
    appStore.addNotification({
      type: 'warning',
      title,
      message
    })
  }

  const notifyInfo = (title, message) => {
    appStore.addNotification({
      type: 'info',
      title,
      message
    })
  }

  const handleApiResponse = (response, successMessage, errorMessage = 'Une erreur est survenue') => {
    if (response.success) {
      notifySuccess('Succès', response.message || successMessage)
      return true
    } else {
      notifyError('Erreur', response.message || errorMessage)
      return false
    }
  }

  const handleApiError = (error, defaultMessage = 'Une erreur est survenue') => {
    console.error('Erreur API:', error)
    notifyError('Erreur', defaultMessage)
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    handleApiResponse,
    handleApiError
  }
}