// Script pour séparer RABAT, SALÉ et SALA AL JADIDA
// Corrige la fusion précédente qui a mis tout dans RABAT

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function separateCities() {
  console.log('🔧 Début de la séparation des villes RABAT/SALÉ/SALA AL JADIDA...\n');
  
  let totalUpdated = 0;
  let errors = 0;
  
  try {
    // 1. Récupérer tous les participants de RABAT
    console.log('📊 Récupération des participants de RABAT...');
    const { data: rabatParticipants, error } = await supabase
      .from('statistiques_participants')
      .select('id, nom, prenom, email, telephone, source')
      .eq('ville', 'RABAT');
    
    if (error) {
      console.error('❌ Erreur récupération RABAT:', error.message);
      return;
    }
    
    console.log(`   ✅ ${rabatParticipants.length} participants trouvés dans RABAT\n`);
    
    // 2. Analyser et séparer selon la source et les données
    for (const participant of rabatParticipants) {
      try {
        let newCity = 'RABAT'; // Par défaut
        
        // Logique de séparation basée sur la source et les données
        if (participant.source === 'whatsapp') {
          // Pour les participants WhatsApp, on peut identifier SALÉ et SALA AL JADIDA
          // en regardant les données originales dans la table whatsapp
          const { data: whatsappData } = await supabase
            .from('whatsapp')
            .select('ville')
            .eq('telephone', participant.telephone)
            .eq('nom', participant.nom)
            .eq('prenom', participant.prenom)
            .single();
          
          if (whatsappData && whatsappData.ville) {
            const originalVille = whatsappData.ville.toUpperCase().trim();
            if (originalVille === 'SALÉ' || originalVille === 'SALE') {
              newCity = 'SALÉ';
            } else if (originalVille === 'SALA AL JADIDA') {
              newCity = 'SALA AL JADIDA';
            }
          }
        } else if (participant.source === 'inscription') {
          // Pour les inscriptions classiques, regarder dans la table inscription
          const { data: inscriptionData } = await supabase
            .from('inscription')
            .select('ville')
            .eq('email', participant.email)
            .eq('nom', participant.nom)
            .eq('prenom', participant.prenom)
            .single();
          
          if (inscriptionData && inscriptionData.ville) {
            const originalVille = inscriptionData.ville.toUpperCase().trim();
            if (originalVille === 'SALÉ' || originalVille === 'SALE') {
              newCity = 'SALÉ';
            } else if (originalVille === 'SALA AL JADIDA') {
              newCity = 'SALA AL JADIDA';
            }
          }
        }
        
        // Mettre à jour si la ville a changé
        if (newCity !== 'RABAT') {
          const { error: updateError } = await supabase
            .from('statistiques_participants')
            .update({ ville: newCity })
            .eq('id', participant.id);
          
          if (updateError) {
            console.error(`❌ Erreur mise à jour ${participant.id}:`, updateError.message);
            errors++;
          } else {
            totalUpdated++;
            console.log(`   🔄 ${participant.prenom} ${participant.nom}: RABAT → ${newCity}`);
          }
        }
        
      } catch (e) {
        console.error(`❌ Erreur traitement participant ${participant.id}:`, e.message);
        errors++;
      }
    }
    
    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const [
      { data: rabatFinal },
      { data: saleFinal },
      { data: salaFinal }
    ] = await Promise.all([
      supabase.from('statistiques_participants').select('ville').eq('ville', 'RABAT'),
      supabase.from('statistiques_participants').select('ville').eq('ville', 'SALÉ'),
      supabase.from('statistiques_participants').select('ville').eq('ville', 'SALA AL JADIDA')
    ]);
    
    console.log('\n📊 Résumé final:');
    console.log(`   RABAT: ${rabatFinal?.length || 0}`);
    console.log(`   SALÉ: ${saleFinal?.length || 0}`);
    console.log(`   SALA AL JADIDA: ${salaFinal?.length || 0}`);
    
    console.log(`\n🎉 Séparation terminée !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Total mis à jour: ${totalUpdated}`);
    console.log(`   - Erreurs: ${errors}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

separateCities();
