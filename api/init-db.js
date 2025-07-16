/**
 * Script d'initialisation de la base de données
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDatabase() {
    console.log('🚀 Initialisation de la base de données EcoDeli...\n');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connexion établie\n');

        // 1. Insérer les rôles
        console.log('📋 Création des rôles...');
        const roles = [
            ['admin', 'Administrateur de la plateforme'],
            ['client', 'Client utilisateur de services'],
            ['livreur', 'Livreur effectuant des livraisons'],
            ['commercant', 'Commerçant proposant des services'],
            ['prestataire', 'Prestataire de services']
        ];

        for (const [nom, description] of roles) {
            await connection.execute(
                'INSERT INTO roles (nom_role, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)',
                [nom, description]
            );
            console.log(`   ✅ Rôle "${nom}" créé`);
        }

        // 2. Créer un admin par défaut
        console.log('\n👤 Création de l\'administrateur par défaut...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        const [adminResult] = await connection.execute(
            `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, compte_actif, email_verifie, date_inscription) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE nom = VALUES(nom)`,
            ['Admin', 'System', 'admin@ecodeli.com', adminPassword, '0123456789', 1, 1]
        );

        if (adminResult.insertId) {
            // Assigner le rôle admin
            const [adminRole] = await connection.execute('SELECT id FROM roles WHERE nom_role = ?', ['admin']);
            await connection.execute(
                'INSERT INTO role_utilisateur (utilisateur_id, role_id) VALUES (?, ?)',
                [adminResult.insertId, adminRole[0].id]
            );
            console.log('   ✅ Admin créé : admin@ecodeli.com / admin123');
        } else {
            console.log('   ℹ️  Admin déjà existant');
        }

        // 3. Vérifier les données
        console.log('\n📊 Vérification des données :');
        const [roleCount] = await connection.execute('SELECT COUNT(*) as count FROM roles');
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM utilisateurs');
        
        console.log(`   - ${roleCount[0].count} rôles`);
        console.log(`   - ${userCount[0].count} utilisateurs`);

        await connection.end();
        console.log('\n✅ Initialisation terminée avec succès !');
        console.log('\n🔐 Comptes de test :');
        console.log('   Admin : admin@ecodeli.com / admin123');
        console.log('\n💡 Vous pouvez maintenant créer de nouveaux comptes via l\'inscription !');

    } catch (error) {
        console.error('\n❌ Erreur lors de l\'initialisation :');
        console.error(`   ${error.message}`);
        process.exit(1);
    }
}

initDatabase();