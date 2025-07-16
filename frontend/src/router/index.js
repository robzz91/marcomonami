import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Pages publiques
import Home from '@/views/Home.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

// Pages privées - Layout principal
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Espaces utilisateurs - Dashboards
import LivreurDashboard from '@/views/livreur/LivreurDashboard.vue'
import CommercantDashboard from '@/views/commercant/CommercantDashboard.vue'
import ClientDashboard from '@/views/client/ClientDashboard.vue'
import PrestataireDashboard from '@/views/prestataire/PrestataireDashboard.vue'

// Pages de l'espace livreur
import TrajetsPage from '@/views/livreur/TrajetsPage.vue'
import LivraisonsPage from '@/views/livreur/LivraisonsPage.vue'
import PortefeuillePage from '@/views/livreur/PortefeuillePage.vue'
import AnnoncesDisponibles from '@/views/livreur/AnnoncesDisponibles.vue'

// Pages de l'espace commerçant
import ContratsPage from '@/views/commercant/ContratsPage.vue'
import FacturesPage from '@/views/commercant/FacturesPage.vue'

// Pages de l'espace client
import ServicesPage from '@/views/client/ServicesPage.vue'
import PrestationsPage from '@/views/client/PrestationsPage.vue'
import ClientLivraisonsPage from '@/views/client/LivraisonsPage.vue'
import ClientAnnoncesPage from '@/views/client/AnnoncesPage.vue'

// Pages de l'espace prestataire
import PrestatairePrestationsPage from '@/views/prestataire/PrestationsPage.vue'
import DisponibilitesPage from '@/views/prestataire/DisponibilitesPage.vue'
import EvaluationsPage from '@/views/prestataire/EvaluationsPage.vue'

// Pages communes
import Profile from '@/views/app/Profile.vue'
import MessagesPage from '@/views/app/MessagesPage.vue'
import AnnoncesPage from '@/views/app/AnnoncesPage.vue'
import AnnonceDetailPage from '@/views/app/AnnonceDetailPage.vue'

// Page 404
import NotFound from '@/views/NotFound.vue'

const routes = [
  // Routes publiques
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { public: true }
  },

  // Routes privées avec layout simplifié
  {
    path: '/app',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      // Redirection par défaut
      {
        path: '',
        redirect: '/app/dashboard'
      },
      
      // Espace Livreur
      {
        path: 'livreur',
        name: 'LivreurDashboard',
        component: LivreurDashboard,
        meta: { roles: ['livreur'] }
      },
      {
        path: 'livreur/trajets',
        name: 'LivreurTrajets',
        component: TrajetsPage,
        meta: { roles: ['livreur'] }
      },
      {
        path: 'livreur/livraisons',
        name: 'LivreurLivraisons',
        component: LivraisonsPage,
        meta: { roles: ['livreur'] }
      },
      {
        path: 'livreur/portefeuille',
        name: 'LivreurPortefeuille',
        component: PortefeuillePage,
        meta: { roles: ['livreur'] }
      },
      {
        path: 'livreur/annonces',
        name: 'LivreurAnnonces',
        component: AnnoncesDisponibles,
        meta: { roles: ['livreur'] }
      },

      // Espace Commerçant
      {
        path: 'commercant',
        name: 'CommercantDashboard',
        component: CommercantDashboard,
        meta: { roles: ['commercant'] }
      },
      {
        path: 'commercant/contrats',
        name: 'CommercantContrats',
        component: ContratsPage,
        meta: { roles: ['commercant'] }
      },
      {
        path: 'commercant/factures',
        name: 'CommercantFactures',
        component: FacturesPage,
        meta: { roles: ['commercant'] }
      },

      // Espace Client
      {
        path: 'client',
        name: 'ClientDashboard',
        component: ClientDashboard,
        meta: { roles: ['client'] }
      },
      {
        path: 'client/services',
        name: 'ClientServices',
        component: ServicesPage,
        meta: { roles: ['client'] }
      },
      {
        path: 'client/prestations',
        name: 'ClientPrestations',
        component: PrestationsPage,
        meta: { roles: ['client'] }
      },
      {
        path: 'client/livraisons',
        name: 'ClientLivraisons',
        component: ClientLivraisonsPage,
        meta: { roles: ['client'] }
      },
      {
        path: 'client/annonces',
        name: 'ClientAnnonces',
        component: ClientAnnoncesPage,
        meta: { roles: ['client'] }
      },
      {
        path: 'client/annonces/nouvelle',
        name: 'ClientNouvelleAnnonce',
        component: ClientAnnoncesPage,
        meta: { roles: ['client'] }
      },

      // Espace Prestataire
      {
        path: 'prestataire',
        name: 'PrestataireDashboard',
        component: PrestataireDashboard,
        meta: { roles: ['prestataire'] }
      },
      {
        path: 'prestataire/prestations',
        name: 'PrestatairePrestations',
        component: PrestatairePrestationsPage,
        meta: { roles: ['prestataire'] }
      },
      {
        path: 'prestataire/disponibilites',
        name: 'PrestataireDisponibilites',
        component: DisponibilitesPage,
        meta: { roles: ['prestataire'] }
      },
      {
        path: 'prestataire/evaluations',
        name: 'PrestataireEvaluations',
        component: EvaluationsPage,
        meta: { roles: ['prestataire'] }
      },


      // Dashboard générique
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Profile
      },

      // Profile commun
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },

      // Pages communes à tous les rôles
      {
        path: 'messages',
        name: 'Messages',
        component: MessagesPage
      },
      {
        path: 'annonces',
        name: 'AnnoncesPubliques',
        component: AnnoncesPage
      },
      {
        path: 'annonces/:id',
        name: 'AnnonceDetail',
        component: AnnonceDetailPage
      }
    ]
  },

  // Page 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guards de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier si l'utilisateur est connecté
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    next('/login')
    return
  }
  
  // Vérifier les rôles requis
  if (to.meta.roles && to.meta.roles.length > 0) {
    const hasRequiredRole = to.meta.roles.some(role => 
      authStore.user?.roles?.includes(role)
    )
    
    if (!hasRequiredRole) {
      // Rediriger vers l'espace approprié selon le rôle principal
      const userRole = authStore.user?.roles?.[0]
      if (userRole) {
        next(`/app/${userRole}`)
      } else {
        next('/login')
      }
      return
    }
  }
  
  // Rediriger les utilisateurs connectés depuis les pages publiques
  if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    const userRole = authStore.user?.roles?.[0]
    if (userRole) {
      next(`/app/${userRole}`)
    } else {
      next('/app/dashboard')
    }
    return
  }
  
  next()
})

export default router