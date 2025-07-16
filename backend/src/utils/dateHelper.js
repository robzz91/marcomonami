import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Utilitaire pour formater les dates de manière sécurisée
 * Évite les erreurs "RangeError: Invalid time value"
 */

/**
 * Valide et convertit une valeur en objet Date
 * @param {*} dateValue - La valeur à convertir (string, Date, number, etc.)
 * @returns {Date|null} - Un objet Date valide ou null
 */
export const parseDate = (dateValue) => {
  if (!dateValue) return null
  
  // Si c'est déjà un objet Date
  if (dateValue instanceof Date) {
    return isValid(dateValue) ? dateValue : null
  }
  
  // Si c'est une string
  if (typeof dateValue === 'string') {
    // Essayer de parser comme ISO string
    const isoDate = parseISO(dateValue)
    if (isValid(isoDate)) return isoDate
    
    // Essayer avec le constructeur Date
    const date = new Date(dateValue)
    return isValid(date) ? date : null
  }
  
  // Si c'est un number (timestamp)
  if (typeof dateValue === 'number') {
    const date = new Date(dateValue)
    return isValid(date) ? date : null
  }
  
  return null
}

/**
 * Formate une date en string avec le format français
 * @param {*} dateValue - La valeur date à formater
 * @param {string} formatString - Le format de sortie (défaut: 'dd/MM/yyyy')
 * @returns {string} - La date formatée ou 'N/A' si invalide
 */
export const formatDate = (dateValue, formatString = 'dd/MM/yyyy') => {
  const date = parseDate(dateValue)
  
  if (!date) {
    return 'N/A'
  }
  
  try {
    return format(date, formatString, { locale: fr })
  } catch (error) {
    console.warn('Erreur lors du formatage de la date:', error)
    return 'N/A'
  }
}

/**
 * Formate une date avec l'heure en format français
 * @param {*} dateValue - La valeur date à formater
 * @returns {string} - La date et heure formatées ou 'N/A' si invalide
 */
export const formatDateTime = (dateValue) => {
  return formatDate(dateValue, 'dd/MM/yyyy HH:mm')
}

/**
 * Formate une date en temps relatif (il y a X temps)
 * @param {*} dateValue - La valeur date à formater
 * @returns {string} - Le temps relatif ou 'N/A' si invalide
 */
export const formatTimeAgo = (dateValue) => {
  const date = parseDate(dateValue)
  
  if (!date) {
    return 'N/A'
  }
  
  try {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: fr 
    })
  } catch (error) {
    console.warn('Erreur lors du formatage du temps relatif:', error)
    return 'N/A'
  }
}

/**
 * Vérifie si une date est valide
 * @param {*} dateValue - La valeur à vérifier
 * @returns {boolean} - true si la date est valide
 */
export const isValidDate = (dateValue) => {
  const date = parseDate(dateValue)
  return date !== null
}

/**
 * Retourne la date actuelle
 * @returns {Date} - La date actuelle
 */
export const getCurrentDate = () => {
  return new Date()
}

/**
 * Formate une date pour un affichage conditionnel
 * @param {*} dateValue - La valeur date à formater
 * @param {string} defaultValue - Valeur par défaut si la date est invalide (défaut: 'Jamais')
 * @param {string} formatString - Le format de sortie
 * @returns {string} - La date formatée ou la valeur par défaut
 */
export const formatDateOrDefault = (dateValue, defaultValue = 'Jamais', formatString = 'dd/MM/yyyy') => {
  const date = parseDate(dateValue)
  
  if (!date) {
    return defaultValue
  }
  
  try {
    return format(date, formatString, { locale: fr })
  } catch (error) {
    console.warn('Erreur lors du formatage de la date:', error)
    return defaultValue
  }
}