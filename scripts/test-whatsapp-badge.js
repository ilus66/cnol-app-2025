// Script de test pour générer un badge WhatsApp avec l'ID 2524
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWhatsAppBadge() {
  console.log('🧪 Test de génération de badge WhatsApp avec l\'ID 2524\n');

  try {
    // 1. Vérifier que l'ID 2524 existe
    const { data: contact, error } = await supabase
      .from('whatsapp')
      .select('*')
      .eq('id', 2524)
      .single();
    
    if (error || !contact) {
      console.error('❌ ID 2524 non trouvé:', error?.message);
      return;
    }
    
    console.log(`✅ Contact trouvé: ${contact.nom} ${contact.prenom} (${contact.email || contact.telephone})`);
    
    // 2. Simuler l'appel API
    const response = await fetch('http://localhost:3006/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 2524 })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Badge généré avec succès:', result);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testWhatsAppBadge(); 