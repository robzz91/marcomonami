<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <PackageIcon class="h-8 w-8 text-white mr-2" />
              <span class="text-white text-xl font-bold">GreenDelivery</span>
            </div>
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <button 
                @click="currentView = 'home'"
                :class="currentView === 'home' ? 'border-green-200 text-white' : 'border-transparent text-green-100 hover:text-white'"
                class="border-b-2 px-1 pt-1 pb-4 text-sm font-medium transition-colors duration-200"
              >
                Accueil
              </button>
              <button 
                @click="currentView = 'annonces'"
                :class="currentView === 'annonces' ? 'border-green-200 text-white' : 'border-transparent text-green-100 hover:text-white'"
                class="border-b-2 px-1 pt-1 pb-4 text-sm font-medium transition-colors duration-200"
              >
                Annonces
              </button>
              <button 
                v-if="isAuthenticated"
                @click="currentView = 'create'"
                :class="currentView === 'create' ? 'border-green-200 text-white' : 'border-transparent text-green-100 hover:text-white'"
                class="border-b-2 px-1 pt-1 pb-4 text-sm font-medium transition-colors duration-200"
              >
                Créer une annonce
              </button>
              <button 
                v-if="isAuthenticated"
                @click="currentView = 'dashboard'"
                :class="currentView === 'dashboard' ? 'border-green-200 text-white' : 'border-transparent text-green-100 hover:text-white'"
                class="border-b-2 px-1 pt-1 pb-4 text-sm font-medium transition-colors duration-200"
              >
                Mes annonces
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div v-if="!isAuthenticated" class="flex space-x-2">
              <button 
                @click="currentView = 'login'"
                class="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Connexion
              </button>
              <button 
                @click="currentView = 'register'"
                class="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Inscription
              </button>
            </div>
            <div v-else class="flex items-center space-x-4">
              <span class="text-green-100">Bonjour, {{ user.prenom }}</span>
              <button 
                @click="logout"
                class="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Home View -->
      <div v-if="currentView === 'home'" class="text-center">
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-12 text-white mb-8">
          <h1 class="text-4xl font-bold mb-4">Livraison écologique et collaborative</h1>
          <p class="text-xl mb-8">Connectez-vous avec des livreurs locaux pour vos colis et services</p>
          <div class="flex justify-center space-x-4">
            <button 
              @click="currentView = 'annonces'"
              class="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Voir les annonces
            </button>
            <button 
              v-if="!isAuthenticated"
              @click="currentView = 'register'"
              class="bg-green-400 hover:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Rejoindre la communauté
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="text-center p-6 bg-white rounded-lg shadow-md">
            <TruckIcon class="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">Livraison rapide</h3>
            <p class="text-gray-600">Des livreurs disponibles dans votre région</p>
          </div>
          <div class="text-center p-6 bg-white rounded-lg shadow-md">
            <LeafIcon class="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">Écologique</h3>
            <p class="text-gray-600">Réduisez votre empreinte carbone</p>
          </div>
          <div class="text-center p-6 bg-white rounded-lg shadow-md">
            <UsersIcon class="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">Communautaire</h3>
            <p class="text-gray-600">Entraide entre voisins</p>
          </div>
        </div>
      </div>

      <!-- Login View -->
      <div v-if="currentView === 'login'" class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Connexion</h2>
        <form @submit.prevent="login">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              v-model="loginForm.email"
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
            <input 
              v-model="loginForm.password"
              type="password" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
        <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
      </div>

      <!-- Register View -->
      <div v-if="currentView === 'register'" class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Inscription</h2>
        <form @submit.prevent="register">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Type de compte</label>
            <select 
              v-model="registerForm.userType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="client">Client (créer des demandes)</option>
              <option value="livreur">Livreur (effectuer des livraisons)</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Prénom</label>
              <input 
                v-model="registerForm.prenom"
                type="text" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Nom</label>
              <input 
                v-model="registerForm.nom"
                type="text" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              v-model="registerForm.email"
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Téléphone</label>
            <input 
              v-model="registerForm.telephone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Adresse</label>
            <input 
              v-model="registerForm.adresse"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Code postal</label>
              <input 
                v-model="registerForm.code_postal"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Ville</label>
              <input 
                v-model="registerForm.ville"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
            <input 
              v-model="registerForm.password"
              type="password" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {{ loading ? 'Inscription...' : 'S\'inscrire' }}
          </button>
        </form>
        <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
      </div>

      <!-- Announcements View -->
      <div v-if="currentView === 'annonces'">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Annonces de livraison</h2>
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p class="mt-2 text-gray-600">Chargement des annonces...</p>
        </div>
        <div v-else-if="annonces.length === 0" class="text-center py-12">
          <PackageIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">Aucune annonce disponible pour le moment</p>
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="annonce in annonces" 
            :key="annonce.id"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ annonce.titre }}</h3>
              <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {{ annonce.categorie_nom }}
              </span>
            </div>
            <p class="text-gray-600 mb-4">{{ annonce.description }}</p>
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-500">
                <MapPinIcon class="h-4 w-4 mr-2" />
                <span>{{ annonce.ville_depart }} → {{ annonce.ville_arrivee }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <CalendarIcon class="h-4 w-4 mr-2" />
                <span>{{ formatDate(annonce.date_livraison_souhaitee) }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <UserIcon class="h-4 w-4 mr-2" />
                <span>{{ annonce.prenom }} {{ annonce.nom_utilisateur }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-green-600">{{ annonce.prix_propose }}€</span>
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Postuler
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Announcement View -->
      <div v-if="currentView === 'create' && isAuthenticated">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Créer une annonce</h2>
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form @submit.prevent="createAnnouncement">
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2">Catégorie</label>
              <select 
                v-model="annonceForm.categorie_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.nom }}
                </option>
              </select>
            </div>
            
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2">Titre</label>
              <input 
                v-model="annonceForm.titre"
                type="text" 
                required
                placeholder="Ex: Livraison d'un colis fragile"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea 
                v-model="annonceForm.description"
                required
                rows="4"
                placeholder="Décrivez votre demande de livraison..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 class="text-lg font-semibold mb-4 text-gray-800">Adresse de départ</h4>
                <div class="space-y-4">
                  <input 
                    v-model="annonceForm.adresse_depart"
                    type="text" 
                    required
                    placeholder="Adresse complète"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div class="grid grid-cols-2 gap-2">
                    <input 
                      v-model="annonceForm.cp_depart"
                      type="text" 
                      required
                      placeholder="Code postal"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input 
                      v-model="annonceForm.ville_depart"
                      type="text" 
                      required
                      placeholder="Ville"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="text-lg font-semibold mb-4 text-gray-800">Adresse d'arrivée</h4>
                <div class="space-y-4">
                  <input 
                    v-model="annonceForm.adresse_arrivee"
                    type="text" 
                    required
                    placeholder="Adresse complète"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div class="grid grid-cols-2 gap-2">
                    <input 
                      v-model="annonceForm.cp_arrivee"
                      type="text" 
                      required
                      placeholder="Code postal"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input 
                      v-model="annonceForm.ville_arrivee"
                      type="text" 
                      required
                      placeholder="Ville"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Date souhaitée</label>
                <input 
                  v-model="annonceForm.date_livraison_souhaitee"
                  type="date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Heure début</label>
                <input 
                  v-model="annonceForm.heure_debut"
                  type="time" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Heure fin</label>
                <input 
                  v-model="annonceForm.heure_fin"
                  type="time" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Poids (kg)</label>
                <input 
                  v-model="annonceForm.poids"
                  type="number" 
                  step="0.1"
                  placeholder="0.0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Dimensions (cm)</label>
                <input 
                  v-model="annonceForm.dimensions"
                  type="text" 
                  placeholder="L x l x H"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Prix proposé (€)</label>
                <input 
                  v-model="annonceForm.prix_propose"
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="mb-6">
              <label class="flex items-center">
                <input 
                  v-model="annonceForm.fragile"
                  type="checkbox" 
                  class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-gray-700">Colis fragile</span>
              </label>
            </div>

            <button 
              type="submit"
              :disabled="loading"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              {{ loading ? 'Création...' : 'Créer l\'annonce' }}
            </button>
          </form>
          <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
        </div>
      </div>

      <!-- Dashboard View -->
      <div v-if="currentView === 'dashboard' && isAuthenticated">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Mes annonces</h2>
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p class="mt-2 text-gray-600">Chargement de vos annonces...</p>
        </div>
        <div v-else-if="userAnnonces.length === 0" class="text-center py-12">
          <PackageIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg mb-4">Vous n'avez pas encore créé d'annonce</p>
          <button 
            @click="currentView = 'create'"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Créer ma première annonce
          </button>
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="annonce in userAnnonces" 
            :key="annonce.id"
            class="bg-white rounded-lg shadow-md p-6"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ annonce.titre }}</h3>
              <span 
                :class="getStatusClass(annonce.statut)"
                class="text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {{ getStatusText(annonce.statut) }}
              </span>
            </div>
            <p class="text-gray-600 mb-4">{{ annonce.description }}</p>
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-500">
                <MapPinIcon class="h-4 w-4 mr-2" />
                <span>{{ annonce.ville_depart }} → {{ annonce.ville_arrivee }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <CalendarIcon class="h-4 w-4 mr-2" />
                <span>{{ formatDate(annonce.date_livraison_souhaitee) }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-green-600">{{ annonce.prix_propose }}€</span>
              <span class="text-sm text-gray-500">{{ formatDate(annonce.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  PackageIcon, 
  TruckIcon, 
  LeafIcon, 
  UsersIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon 
} from 'lucide-vue-next'

// Reactive data
const currentView = ref('home')
const loading = ref(false)
const error = ref('')
const user = ref(null)
const token = ref(localStorage.getItem('token'))
const annonces = ref([])
const userAnnonces = ref([])
const categories = ref([])

// Forms
const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  email: '',
  password: '',
  nom: '',
  prenom: '',
  telephone: '',
  adresse: '',
  ville: '',
  code_postal: '',
  userType: 'client'
})

const annonceForm = ref({
  categorie_id: '',
  titre: '',
  description: '',
  adresse_depart: '',
  cp_depart: '',
  ville_depart: '',
  pays_depart: 'France',
  adresse_arrivee: '',
  cp_arrivee: '',
  ville_arrivee: '',
  pays_arrivee: 'France',
  date_livraison_souhaitee: '',
  heure_debut: '',
  heure_fin: '',
  poids: '',
  dimensions: '',
  fragile: false,
  prix_propose: ''
})

// Computed
const isAuthenticated = computed(() => !!token.value && !!user.value)

// API Base URL
const API_BASE = 'http://localhost:3000/api'

// Methods
const login = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginForm.value)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      currentView.value = 'home'
      loginForm.value = { email: '', password: '' }
    } else {
      error.value = data.error || 'Erreur de connexion'
    }
  } catch (err) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}

const register = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerForm.value)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      currentView.value = 'login'
      registerForm.value = {
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        ville: '',
        code_postal: '',
        userType: 'client'
      }
      error.value = ''
    } else {
      error.value = data.error || 'Erreur lors de l\'inscription'
    }
  } catch (err) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}

const logout = () => {
  token.value = null
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentView.value = 'home'
}

const fetchAnnonces = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/annonces`)
    const data = await response.json()
    
    if (response.ok) {
      annonces.value = data
    }
  } catch (err) {
    console.error('Error fetching announcements:', err)
  } finally {
    loading.value = false
  }
}

const fetchUserAnnonces = async () => {
  if (!token.value) return
  
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/mes-annonces`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    const data = await response.json()
    
    if (response.ok) {
      userAnnonces.value = data
    }
  } catch (err) {
    console.error('Error fetching user announcements:', err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/categories`)
    const data = await response.json()
    
    if (response.ok) {
      categories.value = data
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const createAnnouncement = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`${API_BASE}/annonces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(annonceForm.value)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      currentView.value = 'dashboard'
      annonceForm.value = {
        categorie_id: '',
        titre: '',
        description: '',
        adresse_depart: '',
        cp_depart: '',
        ville_depart: '',
        pays_depart: 'France',
        adresse_arrivee: '',
        cp_arrivee: '',
        ville_arrivee: '',
        pays_arrivee: 'France',
        date_livraison_souhaitee: '',
        heure_debut: '',
        heure_fin: '',
        poids: '',
        dimensions: '',
        fragile: false,
        prix_propose: ''
      }
      await fetchUserAnnonces()
    } else {
      error.value = data.error || 'Erreur lors de la création de l\'annonce'
    }
  } catch (err) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Non spécifiée'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'publiee': 'bg-green-100 text-green-800',
    'en_cours': 'bg-blue-100 text-blue-800',
    'terminee': 'bg-purple-100 text-purple-800',
    'annulee': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    'draft': 'Brouillon',
    'publiee': 'Publiée',
    'en_cours': 'En cours',
    'terminee': 'Terminée',
    'annulee': 'Annulée'
  }
  return texts[status] || status
}

// Watchers
const watchCurrentView = () => {
  if (currentView.value === 'annonces') {
    fetchAnnonces()
  } else if (currentView.value === 'dashboard' && isAuthenticated.value) {
    fetchUserAnnonces()
  } else if (currentView.value === 'create') {
    fetchCategories()
  }
}

// Lifecycle
onMounted(() => {
  // Check for stored user data
  const storedUser = localStorage.getItem('user')
  if (storedUser && token.value) {
    user.value = JSON.parse(storedUser)
  }
  
  // Watch for view changes
  watchCurrentView()
})

// Watch currentView changes
const unwatchCurrentView = ref(null)
unwatchCurrentView.value = () => {
  watchCurrentView()
}

// Update watcher when currentView changes
const updateWatcher = () => {
  watchCurrentView()
}

// Call updateWatcher when currentView changes
const originalCurrentView = currentView.value
const watchCurrentViewChange = () => {
  if (currentView.value !== originalCurrentView) {
    updateWatcher()
  }
}

// Set up reactive watcher
const stopWatcher = () => {
  // This would be where we'd set up a proper Vue watcher
  // For now, we'll call updateWatcher when needed
}
</script>
