import axios from 'axios'
import { useAppStore } from '@/stores/app'

// Configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const appStore = useAppStore()
    
    // Afficher le loader pour les requêtes non-GET
    if (config.method !== 'get') {
      appStore.setLoading(true)
    }
    
    // Ajouter le token d'authentification s'il existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    return response
  },
  (error) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    
    // Gestion des erreurs globales
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token invalide ou expiré
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          delete api.defaults.headers.common['Authorization']
          
          // Rediriger vers la page de connexion si pas déjà dessus
          if (window.location.pathname !== '/login') {
            appStore.addNotification({
              type: 'error',
              title: 'Session expirée',
              message: 'Veuillez vous reconnecter'
            })
            window.location.href = '/login'
          }
          break
          
        case 403:
          appStore.addNotification({
            type: 'error',
            title: 'Accès refusé',
            message: 'Vous n\'avez pas les droits pour effectuer cette action'
          })
          break
          
        case 404:
          appStore.addNotification({
            type: 'error',
            title: 'Ressource non trouvée',
            message: 'La ressource demandée n\'existe pas'
          })
          break
          
        case 422:
          // Erreurs de validation - ne pas afficher de notification globale
          // car elles sont gérées individuellement dans les composants
          break
          
        case 500:
          appStore.addNotification({
            type: 'error',
            title: 'Erreur serveur',
            message: 'Une erreur interne s\'est produite. Veuillez réessayer.'
          })
          break
          
        default:
          if (error.response.status >= 500) {
            appStore.addNotification({
              type: 'error',
              title: 'Erreur serveur',
              message: 'Une erreur s\'est produite. Veuillez réessayer.'
            })
          }
      }
    } else if (error.request) {
      // Erreur réseau
      appStore.addNotification({
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      })
    }
    
    return Promise.reject(error)
  }
)

export default api