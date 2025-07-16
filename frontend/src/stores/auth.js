import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

// Fonction utilitaire pour récupérer les données utilisateur du localStorage
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.warn('Erreur lors du parsing des données utilisateur:', error)
    localStorage.removeItem('user') // Nettoyer les données corrompues
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(getUserFromStorage())
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => {
    if (!user.value?.roles) return null
    // Sur le frontend, les admins apparaissent comme clients
    return user.value.roles.includes('client') ? 'client' : user.value.roles[0]
  })
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.prenom} ${user.value.nom}`
  })

  // Actions
  async function login(credentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.utilisateur
        
        // Sauvegarder le token et les données utilisateur dans localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        
        // Configurer le header Authorization pour les futures requêtes
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Erreur de connexion')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur de connexion'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        // Auto-login après inscription réussie
        if (response.data.data.token) {
          token.value = response.data.data.token
          user.value = response.data.data.utilisateur
          localStorage.setItem('token', token.value)
          localStorage.setItem('user', JSON.stringify(user.value))
          api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        }
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      // Appeler l'API de déconnexion
      await api.post('/auth/logout')
    } catch (err) {
      console.warn('Erreur lors de la déconnexion côté serveur:', err)
    } finally {
      // Nettoyer l'état local
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    
    try {
      const response = await api.get('/auth/profile')
      
      if (response.data.success) {
        user.value = response.data.data
        // Mettre à jour les données utilisateur dans localStorage
        localStorage.setItem('user', JSON.stringify(user.value))
        return user.value
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
      // Si le token est invalide (401), déconnecter l'utilisateur
      if (err.response?.status === 401) {
        await logout()
      }
      // Pour les autres erreurs (réseau, serveur), ne pas déconnecter
      // L'utilisateur peut rester connecté avec les données en cache
    }
  }

  async function updateProfile(profileData) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.put('/auth/profile', profileData)
      
      if (response.data.success) {
        user.value = { ...user.value, ...response.data.data }
        // Mettre à jour les données utilisateur dans localStorage
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function forgotPassword(email) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'envoi')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(token, password) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      
      if (response.data.success) {
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Erreur lors de la réinitialisation')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de la réinitialisation'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Initialiser le store si un token existe
  function initialize() {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      // Seulement essayer de récupérer le profil si on n'a pas déjà les données utilisateur
      if (!user.value) {
        fetchProfile()
      }
    }
  }

  // Nettoyer les erreurs
  function clearError() {
    error.value = null
  }

  // Mettre à jour les informations utilisateur
  function updateUserInfo(newUserInfo) {
    if (user.value) {
      user.value = { ...user.value, ...newUserInfo }
      // Mettre à jour les données utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  function hasRole(role) {
    return userRole.value === role
  }

  // Vérifier si l'utilisateur a l'une des permissions
  function hasAnyRole(roles) {
    return roles.includes(userRole.value)
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    initialize,
    clearError,
    updateUserInfo,
    hasRole,
    hasAnyRole
  }
})