// Script pour nettoyer l'espace Supabase en supprimant les badges les plus anciens
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupSupabaseSpace() {
  console.log('🗑️  Nettoyage de l\'espace Supabase pour libérer 500 MB...\n');
  
  try {
    // 1. Lister tous les fichiers
    console.log('📋 Récupération de la liste des fichiers...');
    const { data: files, error: listError } = await supabase.storage
      .from('logos')
      .list('', { limit: 10000 });
    
    if (listError) {
      console.error('❌ Erreur récupération liste fichiers:', listError.message);
      return;
    }
    
    // 2. Filtrer et trier les badges par date (les plus anciens en premier)
    const badgeFiles = files
      .filter(file => file.name.includes('badge') && file.name.endsWith('.pdf'))
      .sort((a, b) => {
        // Extraire la date du nom de fichier (format: badge-cnol2025-...)
        const dateA = a.name.includes('175') ? parseInt(a.name.match(/175\d+/)?.[0] || '0') : 0;
        const dateB = b.name.includes('175') ? parseInt(b.name.match(/175\d+/)?.[0] || '0') : 0;
        return dateA - dateB; // Plus anciens en premier
      });
    
    console.log(`   ✅ ${badgeFiles.length} badges trouvés\n`);
    
    // 3. Calculer combien de badges supprimer pour libérer 500 MB
    const targetMB = 500;
    let currentSize = 0;
    let filesToDelete = [];
    
    for (const file of badgeFiles) {
      const fileSize = file.metadata?.size || 0;
      const fileSizeMB = fileSize / (1024 * 1024);
      
      if (currentSize < targetMB) {
        filesToDelete.push(file);
        currentSize += fileSizeMB;
      } else {
        break;
      }
    }
    
    console.log(`📊 PLAN DE NETTOYAGE :`);
    console.log(`   🎯 Objectif: ${targetMB} MB à libérer`);
    console.log(`   📁 Badges à supprimer: ${filesToDelete.length}`);
    console.log(`   💾 Espace à libérer: ${currentSize.toFixed(2)} MB`);
    console.log(`   📅 Période: Badges les plus anciens (${filesToDelete.length > 0 ? 'du ' + filesToDelete[0].name : 'N/A'})`);
    
    if (filesToDelete.length === 0) {
      console.log('\n❌ Aucun badge à supprimer');
      return;
    }
    
    // 4. Demander confirmation
    console.log('\n⚠️  ATTENTION : Cette action est irréversible !');
    console.log('   Les badges supprimés ne pourront plus être récupérés.');
    console.log('   Ils sont déjà sauvegardés sur Cloudflare R2.');
    
    // 5. Supprimer les fichiers (simulation d'abord)
    console.log('\n🧪 SIMULATION DE SUPPRESSION (pas de suppression réelle)...');
    
    let deletedCount = 0;
    let freedSpace = 0;
    
    for (const file of filesToDelete.slice(0, 5)) { // Test avec 5 fichiers seulement
      const fileSize = file.metadata?.size || 0;
      const fileSizeMB = fileSize / (1024 * 1024);
      
      console.log(`   🗑️  [SIMULATION] Suppression de: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
      
      // SIMULATION : Ne pas supprimer réellement
      // const { error: deleteError } = await supabase.storage
      //   .from('logos')
      //   .remove([file.name]);
      
      // if (deleteError) {
      //   console.log(`      ❌ Erreur: ${deleteError.message}`);
      // } else {
      //   console.log(`      ✅ Supprimé avec succès`);
      //   deletedCount++;
      //   freedSpace += fileSizeMB;
      // }
      
      deletedCount++;
      freedSpace += fileSizeMB;
    }
    
    console.log(`\n📊 RÉSULTAT DE LA SIMULATION :`);
    console.log(`   ✅ Badges traités: ${deletedCount}`);
    console.log(`   💾 Espace libéré: ${freedSpace.toFixed(2)} MB`);
    
    // 6. Instructions pour la suppression réelle
    console.log('\n🔧 POUR LA SUPPRESSION RÉELLE :');
    console.log('   1. Décommentez les lignes de suppression dans ce script');
    console.log('   2. Relancez le script');
    console.log('   3. Confirmez la suppression');
    
    console.log('\n💡 RECOMMANDATIONS :');
    console.log('   - Supprimez d\'abord les badges les plus anciens');
    console.log('   - Vérifiez que R2 fonctionne parfaitement avant');
    console.log('   - Gardez une sauvegarde des noms de fichiers');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer le nettoyage
cleanupSupabaseSpace();
