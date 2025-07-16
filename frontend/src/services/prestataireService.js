import api from './api'

export const prestataireService = {
  // Prestations
  async getPrestations(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/prestataires/prestations?${params}`)
    return response.data
  },

  async createPrestation(prestationData) {
    const response = await api.post('/prestataires/prestations', prestationData)
    return response.data
  },

  async updatePrestation(prestationId, prestationData) {
    const response = await api.put(`/prestataires/prestations/${prestationId}`, prestationData)
    return response.data
  },

  async deletePrestation(prestationId) {
    const response = await api.delete(`/prestataires/prestations/${prestationId}`)
    return response.data
  },

  async acceptPrestation(prestationId) {
    const response = await api.patch(`/prestataires/prestations/${prestationId}/accept`)
    return response.data
  },

  async declinePrestation(prestationId, reason) {
    const response = await api.patch(`/prestataires/prestations/${prestationId}/decline`, { reason })
    return response.data
  },

  async startPrestation(prestationId) {
    const response = await api.patch(`/prestataires/prestations/${prestationId}/start`)
    return response.data
  },

  async completePrestation(prestationId, completionData) {
    const response = await api.patch(`/prestataires/prestations/${prestationId}/complete`, completionData)
    return response.data
  },

  // Disponibilités
  async getDisponibilites(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/prestataires/disponibilites?${params}`)
    return response.data
  },

  async createDisponibilite(disponibiliteData) {
    const response = await api.post('/prestataires/disponibilites', disponibiliteData)
    return response.data
  },

  async updateDisponibilite(disponibiliteId, disponibiliteData) {
    const response = await api.put(`/prestataires/disponibilites/${disponibiliteId}`, disponibiliteData)
    return response.data
  },

  async deleteDisponibilite(disponibiliteId) {
    const response = await api.delete(`/prestataires/disponibilites/${disponibiliteId}`)
    return response.data
  },

  async duplicateDisponibilite(disponibiliteId, targetDate) {
    const response = await api.post(`/prestataires/disponibilites/${disponibiliteId}/duplicate`, { targetDate })
    return response.data
  },

  // Évaluations
  async getEvaluations(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/prestataires/evaluations?${params}`)
    return response.data
  },

  async replyToEvaluation(evaluationId, replyData) {
    const response = await api.post(`/prestataires/evaluations/${evaluationId}/reply`, replyData)
    return response.data
  },

  async reportEvaluation(evaluationId, reportData) {
    const response = await api.post(`/prestataires/evaluations/${evaluationId}/report`, reportData)
    return response.data
  },

  // Statistiques
  async getStats() {
    const response = await api.get('/prestataires/stats')
    return response.data
  },

  async getEvaluationStats() {
    const response = await api.get('/prestataires/stats/evaluations')
    return response.data
  },

  async getDisponibiliteStats() {
    const response = await api.get('/prestataires/stats/disponibilites')
    return response.data
  }
}