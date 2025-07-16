/**
 * Script de test de connexion à la base de données
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔍 Test de connexion MySQL...\n');
    console.log('Configuration :');
    console.log(`- Host: ${process.env.DB_HOST}`);
    console.log(`- User: ${process.env.DB_USER}`);
    console.log(`- Database: ${process.env.DB_NAME}`);
    console.log(`- Port: ${process.env.DB_PORT || 3306}\n`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connexion réussie !');

        // Test des tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`\n📊 Tables trouvées : ${tables.length}`);
        
        // Vérifier la table utilisateurs
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM utilisateurs');
        console.log(`👥 Nombre d'utilisateurs : ${users[0].count}`);

        // Vérifier la table roles
        const [roles] = await connection.execute('SELECT * FROM roles');
        console.log('\n🎭 Rôles disponibles :');
        roles.forEach(role => {
            console.log(`   - ${role.nom_role} (ID: ${role.id})`);
        });

        await connection.end();
        console.log('\n✅ Test terminé avec succès !');

    } catch (error) {
        console.error('\n❌ Erreur de connexion :');
        console.error(`   ${error.message}`);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Vérifiez vos identifiants MySQL dans le fichier .env');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 MySQL n\'est pas démarré ou n\'écoute pas sur le port configuré');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 La base de données "ecodeli" n\'existe pas. Créez-la avec :');
            console.error('   CREATE DATABASE ecodeli;');
        }
    }
}

testConnection();