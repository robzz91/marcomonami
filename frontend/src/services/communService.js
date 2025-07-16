import api from './api'

export const communService = {
  // Messages et conversations
  async getConversations(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/messages/conversations?${params}`)
    return response.data
  },

  async getMessages(interlocuteurId) {
    const response = await api.get(`/messages/conversation/${interlocuteurId}`)
    return response.data
  },

  async sendMessage(destinataireId, messageData) {
    const response = await api.post('/messages/send', {
      destinataire_id: destinataireId,
      ...messageData
    })
    return response.data
  },

  async createConversation(conversationData) {
    // Pas d'endpoint spécifique, envoyer directement un message crée la conversation
    return this.sendMessage(conversationData.destinataire_id, {
      contenu: conversationData.message || conversationData.contenu
    })
  },

  async markAsRead(expediteurId) {
    const response = await api.patch(`/messages/read/${expediteurId}`)
    return response.data
  },

  async archiveConversation(conversationId) {
    const response = await api.patch(`/messages/conversations/${conversationId}/archive`)
    return response.data
  },

  async deleteConversation(conversationId) {
    const response = await api.delete(`/messages/conversations/${conversationId}`)
    return response.data
  },

  // Annonces publiques
  async getAnnoncesPubliques(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/annonces?${params}`)
    return response.data
  },

  async getAnnonce(annonceId) {
    const response = await api.get(`/annonces/${annonceId}`)
    return response.data
  },

  async proposeService(annonceId, proposalData) {
    const response = await api.post(`/annonces/${annonceId}/proposals`, proposalData)
    return response.data
  },

  async contactAuthor(annonceId, messageData) {
    const response = await api.post(`/annonces/${annonceId}/contact`, messageData)
    return response.data
  },

  // Statistiques publiques
  async getPublicStats() {
    const response = await api.get('/annonces/stats')
    return response.data
  },

  // Notifications
  async getNotifications(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/notifications?${params}`)
    return response.data
  },

  async markNotificationAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  async markAllNotificationsAsRead() {
    const response = await api.patch('/notifications/read-all')
    return response.data
  },

  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }
}