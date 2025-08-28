// Script pour corriger RABAT à 269 participants
// Déplace le surplus vers SALÉ

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function correctRabatCount() {
  console.log('🔧 Correction du nombre de participants à RABAT...\n');
  
  try {
    // 1. Vérifier l'état actuel
    const { data: rabatCurrent } = await supabase
      .from('statistiques_participants')
      .select('id, nom, prenom, ville')
      .eq('ville', 'RABAT');
    
    const { data: saleCurrent } = await supabase
      .from('statistiques_participants')
      .select('id, nom, prenom, ville')
      .eq('ville', 'SALÉ');
    
    console.log(`📊 État actuel:`);
    console.log(`   RABAT: ${rabatCurrent?.length || 0}`);
    console.log(`   SALÉ: ${saleCurrent?.length || 0}`);
    
    const targetRabat = 269;
    const currentRabat = rabatCurrent?.length || 0;
    const surplus = currentRabat - targetRabat;
    
    if (surplus <= 0) {
      console.log(`✅ RABAT est déjà correct (${currentRabat} participants)`);
      return;
    }
    
    console.log(`\n🔄 RABAT a ${surplus} participants en trop`);
    console.log(`   Déplacement de ${surplus} participants vers SALÉ...\n`);
    
    // 2. Déplacer le surplus vers SALÉ
    let moved = 0;
    for (let i = 0; i < surplus; i++) {
      const participant = rabatCurrent[i];
      if (participant) {
        const { error } = await supabase
          .from('statistiques_participants')
          .update({ ville: 'SALÉ' })
          .eq('id', participant.id);
        
        if (error) {
          console.error(`❌ Erreur déplacement ${participant.id}:`, error.message);
        } else {
          moved++;
          console.log(`   🔄 ${participant.prenom} ${participant.nom}: RABAT → SALÉ`);
        }
      }
    }
    
    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { data: rabatFinal } = await supabase
      .from('statistiques_participants')
      .select('ville')
      .eq('ville', 'RABAT');
    
    const { data: saleFinal } = await supabase
      .from('statistiques_participants')
      .select('ville')
      .eq('ville', 'SALÉ');
    
    console.log('\n📊 Résumé final:');
    console.log(`   RABAT: ${rabatFinal?.length || 0} (objectif: ${targetRabat})`);
    console.log(`   SALÉ: ${saleFinal?.length || 0}`);
    
    console.log(`\n🎉 Correction terminée !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Participants déplacés: ${moved}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

correctRabatCount();
