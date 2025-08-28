/**
 * Test simple de l'API WhatsApp
 * Envoie un message de test directement
 */

const TEST_PHONE = '+212606152378';
const BASE_URL = 'http://localhost:3000';

async function testWhatsAppSimple() {
  try {
    console.log('🧪 Test simple de l\'API WhatsApp...');
    console.log('📱 Numéro de test:', TEST_PHONE);
    console.log('🌐 Base URL:', BASE_URL);
    
    // Test d'envoi d'un message simple
    console.log('\n📤 Envoi du message de test...');
    
    const response = await fetch(`${BASE_URL}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: TEST_PHONE,
        text: `🧪 Test de l'API WhatsApp CNOL 2025

Bonjour Ouail Ouahi !

Ceci est un test de l'API WhatsApp pour l'envoi de tickets.
Si vous recevez ce message, l'intégration WhatsApp fonctionne parfaitement !

🎫 Prochainement : envoi automatique de tickets pour masterclasses et ateliers
📅 Congrès CNOL 2025 : 10-12 octobre, Rabat
📍 Fondation Mohammed VI

L'équipe CNOL`,
        documentUrl: null,
        fileName: null
      })
    });
    
    console.log('📊 Statut de la réponse:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Message envoyé avec succès !');
      console.log('📋 Détails:', result);
    } else {
      const errorText = await response.text();
      console.log('⚠️ Erreur lors de l\'envoi:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Détails de l\'erreur:', errorJson);
      } catch (e) {
        console.log('📋 Erreur brute:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testWhatsAppSimple(); 