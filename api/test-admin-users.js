const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAdminUsersRoute() {
    try {
        console.log('🔍 Test de la route /api/admin/utilisateurs\n');
        
        // 1. D'abord, se connecter en tant qu'admin
        console.log('1. Connexion en tant qu\'admin...');
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@ecodeli.com',
            password: 'Admin123!'
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const cookie = loginResponse.headers['set-cookie'];
        console.log('✅ Connexion réussie\n');
        
        // 2. Tester la route /api/admin/utilisateurs
        console.log('2. Test de la route /api/admin/utilisateurs...');
        const usersResponse = await axios.get(`${API_URL}/api/admin/utilisateurs`, {
            headers: {
                'Cookie': cookie
            }
        });
        
        console.log('✅ Réponse reçue:');
        console.log('- Success:', usersResponse.data.success);
        console.log('- Nombre d\'utilisateurs:', usersResponse.data.data.length);
        console.log('- Pagination:', usersResponse.data.pagination);
        
        if (usersResponse.data.data.length > 0) {
            console.log('\n📋 Premiers utilisateurs:');
            usersResponse.data.data.slice(0, 3).forEach(user => {
                console.log(`  - ${user.nom} ${user.prenom} (${user.email}) - ${user.compte_actif ? 'Actif' : 'Inactif'}`);
            });
        }
        
        // 3. Tester avec des paramètres de recherche
        console.log('\n3. Test avec paramètres de recherche (search=admin)...');
        const searchResponse = await axios.get(`${API_URL}/api/admin/utilisateurs?search=admin`, {
            headers: {
                'Cookie': cookie
            }
        });
        
        console.log('✅ Résultats de recherche:');
        console.log('- Nombre de résultats:', searchResponse.data.data.length);
        
        // 4. Tester la pagination
        console.log('\n4. Test de la pagination (page=2, limit=5)...');
        const paginationResponse = await axios.get(`${API_URL}/api/admin/utilisateurs?page=2&limit=5`, {
            headers: {
                'Cookie': cookie
            }
        });
        
        console.log('✅ Pagination:');
        console.log('- Page actuelle:', paginationResponse.data.pagination.page);
        console.log('- Éléments par page:', paginationResponse.data.pagination.limit);
        console.log('- Total pages:', paginationResponse.data.pagination.totalPages);
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('\n⚠️  Assurez-vous que l\'utilisateur admin existe dans la base de données');
            console.log('   Email: admin@ecodeli.com');
            console.log('   Mot de passe: Admin123!');
        }
    }
}

// Exécuter le test
testAdminUsersRoute();