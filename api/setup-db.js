/**
 * Script de configuration de la base de données optimisée
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('🚀 Configuration de la base de données EcoDeli optimisée...\n');

    try {
        // Connexion sans spécifier la base de données pour pouvoir la créer
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✅ Connexion MySQL établie');

        // Lire le fichier SQL optimisé
        const sqlPath = path.join(__dirname, '..', 'bdd-optimized.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Lecture du schéma optimisé...');

        // Exécuter le script SQL
        console.log('🔄 Application du nouveau schéma...');
        await connection.query(sqlContent);

        console.log('✅ Schéma appliqué avec succès !');

        // Vérification
        await connection.query('USE ecodeli');
        const [tables] = await connection.query('SHOW TABLES');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM utilisateurs');
        const [roles] = await connection.query('SELECT COUNT(*) as count FROM roles');

        console.log('\n📊 Vérification des données :');
        console.log(`   - ${tables.length} tables créées`);
        console.log(`   - ${roles[0].count} rôles configurés`);
        console.log(`   - ${users[0].count} utilisateur admin créé`);

        // Afficher les rôles
        const [rolesList] = await connection.query('SELECT nom_role, description FROM roles');
        console.log('\n🎭 Rôles disponibles :');
        rolesList.forEach(role => {
            console.log(`   ✅ ${role.nom_role} : ${role.description}`);
        });

        await connection.end();

        console.log('\n🎉 Configuration terminée avec succès !');
        console.log('\n🔐 Compte administrateur :');
        console.log('   Email : admin@ecodeli.com');
        console.log('   Mot de passe : admin123');
        console.log('\n💡 Vous pouvez maintenant :');
        console.log('   1. Redémarrer l\'API');
        console.log('   2. Tester l\'inscription dans le frontend');
        console.log('   3. Vous connecter avec le compte admin dans l\'interface admin');

    } catch (error) {
        console.error('\n❌ Erreur lors de la configuration :');
        console.error(`   ${error.message}`);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Vérifiez vos identifiants MySQL dans le fichier .env');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Assurez-vous que MySQL est démarré');
        }
        
        process.exit(1);
    }
}

setupDatabase();