/**
 * Test de l'API WhatsApp pour l'envoi de tickets
 * Ce script teste l'envoi d'un ticket par WhatsApp via l'API
 */

import fetch from 'node-fetch';

// Configuration de test
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_PHONE = '+212606152378';

async function testWhatsAppAPI() {
  try {
    console.log('🧪 Test de l\'API WhatsApp pour tickets...');
    console.log('📱 Numéro de test:', TEST_PHONE);
    console.log('🌐 Base URL:', BASE_URL);
    
    // Test 1: Vérifier que l'API WhatsApp fonctionne
    console.log('\n1️⃣ Test de l\'API WhatsApp de base...');
    
    const whatsappTestResponse = await fetch(`${BASE_URL}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: TEST_PHONE,
        text: '🧪 Test de l\'API WhatsApp CNOL - Si vous recevez ce message, l\'API fonctionne !',
        documentUrl: null,
        fileName: null
      })
    });
    
    if (whatsappTestResponse.ok) {
      const result = await whatsappTestResponse.json();
      console.log('✅ Test WhatsApp de base réussi:', result);
    } else {
      const error = await whatsappTestResponse.text();
      console.log('⚠️ Test WhatsApp de base échoué:', error);
    }
    
    // Test 2: Créer une réservation de test et envoyer un ticket
    console.log('\n2️⃣ Test d\'envoi de ticket complet...');
    
    // Simuler l'envoi d'un ticket de masterclass
    const ticketTestResponse = await fetch(`${BASE_URL}/api/renvoyer-ticket-masterclass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 'TEST-MASTERCLASS-001',
        testMode: true,
        testPhone: TEST_PHONE,
        testData: {
          nom: 'OUAHI',
          prenom: 'Ouail',
          email: 'ouail.ouahi@test.com',
          telephone: TEST_PHONE,
          eventType: 'Masterclass',
          eventTitle: 'Optique Avancée et Technologies Modernes',
          eventDate: '2025-10-10T14:00:00Z',
          salle: 'Salle Principale',
          intervenant: 'Dr. Ahmed Benali'
        }
      })
    });
    
    if (ticketTestResponse.ok) {
      const result = await ticketTestResponse.json();
      console.log('✅ Test d\'envoi de ticket réussi:', result);
    } else {
      const error = await ticketTestResponse.text();
      console.log('⚠️ Test d\'envoi de ticket échoué:', error);
    }
    
    console.log('\n🎯 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testWhatsAppAPI(); 