/**
 * Script de test pour l'envoi de ticket WhatsApp
 * Teste l'envoi d'un ticket de masterclass par WhatsApp
 */

import { generateTicket } from './lib/generateTicket.js';
import { sendTicketWhatsApp } from './lib/mailer.js';

async function testWhatsAppTicket() {
  try {
    console.log('🎫 Test d\'envoi de ticket WhatsApp...');
    
    // Données de test pour Ouail Ouahi
    const testData = {
      nom: 'OUAHI',
      prenom: 'Ouail',
      email: 'ouail.ouahi@test.com',
      eventType: 'Masterclass',
      eventTitle: 'Optique Avancée et Technologies Modernes',
      eventDate: '2025-10-10T14:00:00Z',
      reservationId: 'TEST-001',
      salle: 'Salle Principale',
      intervenant: 'Dr. Ahmed Benali'
    };

    console.log('📋 Données de test:', testData);
    
    // 1. Générer le ticket PDF
    console.log('🔄 Génération du ticket PDF...');
    const pdfBuffer = await generateTicket(testData);
    console.log('✅ Ticket PDF généré:', pdfBuffer.length, 'bytes');
    
    // 2. Préparer le nom de fichier
    const pdfFileName = `ticket-masterclass-${testData.eventTitle.replace(/\s+/g, '-')}-${testData.prenom}-${testData.nom}.pdf`;
    
    // 3. Envoyer par WhatsApp
    console.log('📱 Envoi par WhatsApp...');
    const result = await sendTicketWhatsApp({
      to: '+212606152378',
      nom: testData.nom,
      prenom: testData.prenom,
      eventType: testData.eventType,
      eventTitle: testData.eventTitle,
      eventDate: testData.eventDate,
      pdfBuffer,
      pdfFileName
    });
    
    console.log('🎉 Ticket WhatsApp envoyé avec succès !');
    console.log('📎 URL du ticket:', result.publicUrl);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testWhatsAppTicket(); 