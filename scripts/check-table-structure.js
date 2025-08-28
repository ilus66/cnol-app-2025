// Script pour vérifier la structure des tables
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 VÉRIFICATION DE LA STRUCTURE DES TABLES...\n');
  
  try {
    // 1. Vérifier la table whatsapp_envois
    console.log('📋 Table whatsapp_envois :');
    const { data: whatsappData, error: whatsappError } = await supabase
      .from('whatsapp_envois')
      .select('*')
      .limit(1);
    
    if (whatsappError) {
      console.error('   ❌ Erreur:', whatsappError.message);
    } else if (whatsappData && whatsappData.length > 0) {
      console.log('   ✅ Structure:');
      Object.keys(whatsappData[0]).forEach(key => {
        console.log(`      - ${key}: ${typeof whatsappData[0][key]}`);
      });
    } else {
      console.log('   ℹ️  Table vide');
    }
    
    // 2. Vérifier la table inscription
    console.log('\n📋 Table inscription :');
    const { data: inscriptionData, error: inscriptionError } = await supabase
      .from('inscription')
      .select('*')
      .limit(1);
    
    if (inscriptionError) {
      console.error('   ❌ Erreur:', inscriptionError.message);
    } else if (inscriptionData && inscriptionData.length > 0) {
      console.log('   ✅ Structure:');
      Object.keys(inscriptionData[0]).forEach(key => {
        console.log(`      - ${key}: ${typeof inscriptionData[0][key]}`);
      });
    } else {
      console.log('   ℹ️  Table vide');
    }
    
    // 3. Vérifier la table statistiques_participants
    console.log('\n📋 Table statistiques_participants :');
    const { data: statsData, error: statsError } = await supabase
      .from('statistiques_participants')
      .select('*')
      .limit(1);
    
    if (statsError) {
      console.error('   ❌ Erreur:', statsError.message);
    } else if (statsData && statsData.length > 0) {
      console.log('   ✅ Structure:');
      Object.keys(statsData[0]).forEach(key => {
        console.log(`      - ${key}: ${typeof statsData[0][key]}`);
      });
    } else {
      console.log('   ℹ️  Table vide');
    }
    
    // 4. Compter les enregistrements
    console.log('\n📊 COMPTAGE DES ENREGISTREMENTS :');
    
    const { count: inscriptionCount } = await supabase
      .from('inscription')
      .select('*', { count: 'exact', head: true });
    
    const { count: whatsappCount } = await supabase
      .from('whatsapp_envois')
      .select('*', { count: 'exact', head: true });
    
    const { count: statsCount } = await supabase
      .from('statistiques_participants')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   📝 Inscriptions: ${inscriptionCount || 0}`);
    console.log(`   📱 WhatsApp envois: ${whatsappCount || 0}`);
    console.log(`   📊 Statistiques: ${statsCount || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la vérification
checkTableStructure();
