import api from './api'

export const livreurService = {
  // Trajets
  async getTrajets(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/livreurs/trajets?${params}`)
    return response.data
  },

  async createTrajet(trajetData) {
    const response = await api.post('/livreurs/trajets', trajetData)
    return response.data
  },

  async updateTrajet(trajetId, trajetData) {
    const response = await api.put(`/livreurs/trajets/${trajetId}`, trajetData)
    return response.data
  },

  async deleteTrajet(trajetId) {
    const response = await api.delete(`/livreurs/trajets/${trajetId}`)
    return response.data
  },

  async startTrajet(trajetId) {
    const response = await api.patch(`/livreurs/trajets/${trajetId}/start`)
    return response.data
  },

  async endTrajet(trajetId) {
    const response = await api.patch(`/livreurs/trajets/${trajetId}/end`)
    return response.data
  },

  // Livraisons
  async getLivraisons(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/livreurs/livraisons?${params}`)
    return response.data
  },

  async startLivraison(livraisonId) {
    const response = await api.patch(`/livreurs/livraisons/${livraisonId}/start`)
    return response.data
  },

  async confirmLivraison(livraisonId, confirmationData) {
    const response = await api.patch(`/livreurs/livraisons/${livraisonId}/confirm`, confirmationData)
    return response.data
  },

  async reportProblem(livraisonId, problemData) {
    const response = await api.patch(`/livreurs/livraisons/${livraisonId}/problem`, problemData)
    return response.data
  },

  // Portefeuille
  async getPortefeuille() {
    const response = await api.get('/livreurs/portefeuille')
    return response.data
  },

  async getTransactions(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/livreurs/transactions?${params}`)
    return response.data
  },

  async requestPayout(payoutData) {
    const response = await api.post('/livreurs/payout', payoutData)
    return response.data
  },

  async updateBankInfo(bankData) {
    const response = await api.put('/livreurs/bank-info', bankData)
    return response.data
  },

  async getBankInfo() {
    const response = await api.get('/livreurs/bank-info')
    return response.data
  },

  // Statistiques
  async getStats() {
    const response = await api.get('/livreurs/stats')
    return response.data
  }
}