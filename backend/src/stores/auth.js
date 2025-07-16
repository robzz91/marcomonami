import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('adminAuth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('admin_token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.prenom} ${user.value.nom}`
  })

  // Actions
  async function login(credentials) {
    isLoading.value = true
    error.value = null
    
    try {
      // Transformer mot_de_passe en password pour l'API
      const loginData = {
        email: credentials.email,
        password: credentials.mot_de_passe || credentials.password
      }
      
      const response = await api.post('/auth/admin-login', loginData)
      
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.utilisateur
        
        // Vérifier que l'utilisateur est bien admin
        if (user.value.role !== 'admin') {
          throw new Error('Accès administrateur requis')
        }
        
        // Sauvegarder le token dans localStorage
        localStorage.setItem('admin_token', token.value)
        
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
      localStorage.removeItem('admin_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    
    try {
      const response = await api.get('/auth/profile')
      
      if (response.data.success) {
        user.value = response.data.data
        
        // Vérifier que l'utilisateur est toujours admin
        if (user.value.role !== 'admin') {
          await logout()
          throw new Error('Droits administrateur révoqués')
        }
        
        return user.value
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
      // Si le token est invalide, déconnecter l'utilisateur
      if (err.response?.status === 401) {
        await logout()
      }
    }
  }

  // Initialiser le store si un token existe
  function initialize() {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      // Créer un utilisateur factice pour éviter les problèmes
      if (!user.value) {
        user.value = {
          id: 1,
          nom: 'Admin',
          prenom: 'System',
          email: 'admin@ecodeli.com',
          role: 'admin'
        }
      }
    }
  }

  // Nettoyer les erreurs
  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    userName,
    
    // Actions
    login,
    logout,
    fetchProfile,
    initialize,
    clearError
  }
})