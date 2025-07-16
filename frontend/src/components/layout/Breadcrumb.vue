<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-4">
      <li>
        <div>
          <router-link 
            to="/app" 
            class="text-gray-400 hover:text-gray-500"
          >
            <HomeIcon class="flex-shrink-0 h-5 w-5" aria-hidden="true" />
            <span class="sr-only">Accueil</span>
          </router-link>
        </div>
      </li>
      
      <li v-for="(page, index) in pages" :key="page.name">
        <div class="flex items-center">
          <ChevronRightIcon 
            class="flex-shrink-0 h-5 w-5 text-gray-400" 
            aria-hidden="true" 
          />
          <router-link
            v-if="index < pages.length - 1"
            :to="page.href"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            {{ page.name }}
          </router-link>
          <span
            v-else
            class="ml-4 text-sm font-medium text-gray-900"
            aria-current="page"
          >
            {{ page.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { communService } from '@/services/communService'

const route = useRoute()
const annonceTitle = ref('')

const pages = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment)
  const breadcrumbs = []
  
  // Ignorer le premier segment 'app'
  if (pathSegments[0] === 'app') {
    pathSegments.shift()
  }
  
  let currentPath = '/app'
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Mapper les segments aux noms affichables
    const nameMap = {
      'livreur': 'Livreur',
      'commercant': 'Commerçant', 
      'client': 'Client',
      'prestataire': 'Prestataire',
      'dashboard': 'Tableau de bord',
      'trajets': 'Trajets',
      'livraisons': 'Livraisons',
      'portefeuille': 'Portefeuille',
      'contrats': 'Contrats',
      'factures': 'Factures',
      'services': 'Services',
      'prestations': 'Prestations',
      'annonces': 'Annonces',
      'disponibilites': 'Disponibilités',
      'evaluations': 'Évaluations',
      'users': 'Utilisateurs',
      'validation': 'Validation',
      'reports': 'Rapports',
      'moderation': 'Modération',
      'messages': 'Messages',
      'profile': 'Profil'
    }
    
    let name = nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    // Si c'est un ID d'annonce et qu'on a le titre, l'utiliser
    if (index === pathSegments.length - 1 && pathSegments[index - 1] === 'annonces' && !isNaN(segment)) {
      name = annonceTitle.value || `Annonce #${segment}`
    }
    
    breadcrumbs.push({
      name,
      href: currentPath
    })
  })
  
  return breadcrumbs
})

// Charger le titre de l'annonce si on est sur une page de détail
watch(() => route.path, async (newPath) => {
  const pathSegments = newPath.split('/').filter(segment => segment)
  
  // Vérifier si on est sur une page de détail d'annonce
  if (pathSegments.length >= 3 && pathSegments[pathSegments.length - 2] === 'annonces') {
    const annonceId = pathSegments[pathSegments.length - 1]
    
    if (!isNaN(annonceId)) {
      try {
        const response = await communService.getAnnonce(annonceId)
        annonceTitle.value = response.titre || response.title || ''
      } catch (error) {
        console.error('Erreur chargement titre annonce:', error)
        annonceTitle.value = ''
      }
    }
  } else {
    annonceTitle.value = ''
  }
}, { immediate: true })
</script>