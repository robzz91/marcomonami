// Script de test pour le modèle Message
const Message = require('./api/models/Message');

async function testSendMessage() {
    try {
        console.log('Test 1: Avec tous les paramètres');
        const result1 = await Message.sendMessage(
            1,           // expediteurId
            2,           // destinataireId
            'Test message', // contenu
            1,           // annonceId
            'Test sujet'    // sujet
        );
        console.log('Résultat 1:', result1);
        
        console.log('\nTest 2: Sans annonce ni sujet');
        const result2 = await Message.sendMessage(
            1,           // expediteurId
            2,           // destinataireId
            'Test message sans annonce' // contenu
        );
        console.log('Résultat 2:', result2);
        
    } catch (error) {
        console.error('Erreur:', error);
    }
    
    process.exit(0);
}

testSendMessage();