// Script pour vérifier les IDs manquants dans la table whatsapp
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingIds() {
  console.log('🔍 Vérification des IDs manquants dans la table whatsapp\n');

  try {
    // 1. Récupérer tous les IDs existants
    const { data: allIds, error } = await supabase
      .from('whatsapp')
      .select('id')
      .order('id');
    
    if (error) {
      console.error('❌ Erreur récupération IDs:', error.message);
      return;
    }
    
    console.log(`📊 Total d'IDs trouvés: ${allIds.length}`);
    
    // 2. Vérifier les IDs manquants entre 1 et le dernier ID
    const existingIds = allIds.map(item => item.id);
    const maxId = Math.max(...existingIds);
    const missingIds = [];
    
    for (let i = 1; i <= maxId; i++) {
      if (!existingIds.includes(i)) {
        missingIds.push(i);
      }
    }
    
    console.log(`🔍 IDs manquants entre 1 et ${maxId}:`);
    if (missingIds.length > 0) {
      missingIds.forEach(id => {
        console.log(`   - ID ${id} manquant`);
      });
    } else {
      console.log(`   ✅ Aucun ID manquant`);
    }
    
    // 3. Vérifier spécifiquement l'ID 2557
    if (existingIds.includes(2557)) {
      console.log(`✅ ID 2557 existe dans la table`);
    } else {
      console.log(`❌ ID 2557 n'existe PAS dans la table`);
      
      // 4. Chercher dans statistiques_participants
      const { data: statsContact } = await supabase
        .from('statistiques_participants')
        .select('*')
        .eq('identifiant', 'whatsapp_2557')
        .single();
      
      if (statsContact) {
        console.log(`📊 ID 2557 trouvé dans statistiques_participants:`, statsContact);
      } else {
        console.log(`❌ ID 2557 non trouvé dans statistiques_participants non plus`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkMissingIds(); 