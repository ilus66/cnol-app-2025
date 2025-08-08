// Script de test pour vérifier la recherche dans les deux tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDualSearch() {
  console.log('🧪 Test de la recherche dans les deux tables\n');

  try {
    // 1. Test avec un ID qui existe dans whatsapp
    console.log('📱 Test 1: ID qui existe dans whatsapp (2524)');
    const response1 = await fetch('http://localhost:3006/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 2524 })
    });
    
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ Succès - Contact trouvé dans whatsapp:', result1.source);
    } else {
      const error1 = await response1.text();
      console.log('❌ Erreur:', error1);
    }

    // 2. Test avec un ID qui existe dans inscription
    console.log('\n📊 Test 2: ID qui existe dans inscription (1)');
    const response2 = await fetch('http://localhost:3006/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1 })
    });
    
    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ Succès - Contact trouvé dans inscription:', result2.source);
    } else {
      const error2 = await response2.text();
      console.log('❌ Erreur:', error2);
    }

    // 3. Test avec un ID qui n'existe nulle part
    console.log('\n❌ Test 3: ID qui n\'existe nulle part (999999)');
    const response3 = await fetch('http://localhost:3006/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 999999 })
    });
    
    if (!response3.ok) {
      const error3 = await response3.json();
      console.log('✅ Erreur attendue - Contact introuvable:', error3.message);
    } else {
      console.log('❌ Problème: Contact trouvé alors qu\'il ne devrait pas exister');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDualSearch(); 