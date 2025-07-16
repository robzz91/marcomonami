import api from './api'

export const clientService = {
  // Services
  async getServices(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/services?${params}`)
    return response.data
  },

  async getService(serviceId) {
    const response = await api.get(`/services/${serviceId}`)
    return response.data
  },

  async reserveService(serviceId, reservationData) {
    const response = await api.post(`/services/${serviceId}/reserve`, reservationData)
    return response.data
  },

  // Prestations
  async getPrestations(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/clients/prestations?${params}`)
    return response.data
  },

  async getPrestation(prestationId) {
    const response = await api.get(`/clients/prestations/${prestationId}`)
    return response.data
  },

  async cancelPrestation(prestationId, reason) {
    const response = await api.patch(`/clients/prestations/${prestationId}/cancel`, { reason })
    return response.data
  },

  async submitReview(prestationId, reviewData) {
    const response = await api.post(`/clients/prestations/${prestationId}/review`, reviewData)
    return response.data
  },

  // Annonces
  async getMyAnnonces(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/clients/annonces?${params}`)
    return response.data
  },

  async createAnnonce(annonceData) {
    const response = await api.post('/clients/annonces', annonceData)
    return response.data
  },

  async updateAnnonce(annonceId, annonceData) {
    const response = await api.put(`/clients/annonces/${annonceId}`, annonceData)
    return response.data
  },

  async deleteAnnonce(annonceId) {
    const response = await api.delete(`/clients/annonces/${annonceId}`)
    return response.data
  },

  async publishAnnonce(annonceId) {
    const response = await api.patch(`/clients/annonces/${annonceId}/publish`)
    return response.data
  },

  async archiveAnnonce(annonceId) {
    const response = await api.patch(`/clients/annonces/${annonceId}/archive`)
    return response.data
  },

  // Statistiques
  async getStats() {
    const response = await api.get('/clients/stats')
    return response.data
  }
}