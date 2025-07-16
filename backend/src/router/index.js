import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AdminLayout from '@/components/layouts/AdminLayout.vue'

// Pages d'authentification
import Login from '@/views/auth/Login.vue'

// Pages d'administration
import Dashboard from '@/views/Dashboard.vue'
import UsersManagement from '@/views/users/UsersManagement.vue'
import UserDetails from '@/views/users/UserDetails.vue'
import Moderation from '@/views/moderation/Moderation.vue'
import Reports from '@/views/reports/Reports.vue'
import Settings from '@/views/settings/Settings.vue'
import Announcements from '@/views/content/Announcements.vue'
import Services from '@/views/content/Services.vue'
import Deliveries from '@/views/operations/Deliveries.vue'
import Finances from '@/views/finances/Finances.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'users',
        name: 'UsersManagement',
        component: UsersManagement
      },
      {
        path: 'users/:id',
        name: 'UserDetails',
        component: UserDetails,
        props: true
      },
      {
        path: 'moderation',
        name: 'Moderation',
        component: Moderation
      },
      {
        path: 'reports',
        name: 'Reports',
        component: Reports
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: Announcements
      },
      {
        path: 'services',
        name: 'Services',
        component: Services
      },
      {
        path: 'deliveries',
        name: 'Deliveries',
        component: Deliveries
      },
      {
        path: 'finances',
        name: 'Finances',
        component: Finances
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navigation pour l'authentification
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth !== false) {
    // Si pas de token, rediriger vers login
    if (!authStore.token) {
      return next('/login')
    }
    
    // Si pas d'utilisateur chargé, essayer de charger le profil
    if (!authStore.user) {
      try {
        await authStore.fetchProfile()
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        return next('/login')
      }
    }
    
    // Vérifier si l'utilisateur est admin
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      console.warn('Accès refusé: droits administrateur requis')
      return next('/login')
    }
  }
  
  // Si déjà connecté et tentative d'accès à login, rediriger vers dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    return next('/')
  }
  
  next()
})

export default router