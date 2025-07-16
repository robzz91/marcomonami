import api from './api'

export const commercantService = {
  // Contrats
  async getContrats(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/commercants/contrats?${params}`)
    return response.data
  },

  async createContrat(contratData) {
    const response = await api.post('/commercants/contrats', contratData)
    return response.data
  },

  async updateContrat(contratId, contratData) {
    const response = await api.put(`/commercants/contrats/${contratId}`, contratData)
    return response.data
  },

  async deleteContrat(contratId) {
    const response = await api.delete(`/commercants/contrats/${contratId}`)
    return response.data
  },

  async activateContrat(contratId) {
    const response = await api.patch(`/commercants/contrats/${contratId}/activate`)
    return response.data
  },

  async cancelContrat(contratId, reason) {
    const response = await api.patch(`/commercants/contrats/${contratId}/cancel`, { reason })
    return response.data
  },

  // Factures
  async getFactures(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/commercants/factures?${params}`)
    return response.data
  },

  async createFacture(factureData) {
    const response = await api.post('/commercants/factures', factureData)
    return response.data
  },

  async updateFacture(factureId, factureData) {
    const response = await api.put(`/commercants/factures/${factureId}`, factureData)
    return response.data
  },

  async deleteFacture(factureId) {
    const response = await api.delete(`/commercants/factures/${factureId}`)
    return response.data
  },

  async sendFacture(factureId) {
    const response = await api.patch(`/commercants/factures/${factureId}/send`)
    return response.data
  },

  async markFactureAsPaid(factureId, paymentData) {
    const response = await api.patch(`/commercants/factures/${factureId}/paid`, paymentData)
    return response.data
  },

  async downloadFacturePDF(factureId) {
    const response = await api.get(`/commercants/factures/${factureId}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  async exportFactures(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/commercants/factures/export?${params}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Statistiques
  async getStatsContrats() {
    const response = await api.get('/commercants/stats/contrats')
    return response.data
  },

  async getStatsFactures() {
    const response = await api.get('/commercants/stats/factures')
    return response.data
  }
}