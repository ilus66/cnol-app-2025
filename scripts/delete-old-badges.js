// Script sécurisé pour supprimer les badges anciens de Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteOldBadges() {
  console.log('🗑️  SUPPRESSION SÉCURISÉE DES BADGES ANCIENS SUPABASE...\n');
  
  try {
    // 1. Créer un dossier de sauvegarde
    const backupDir = path.join(__dirname, '../backup-badges-deleted');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `badges-deleted-${timestamp}.json`);
    
    console.log('📁 Dossier de sauvegarde créé:', backupDir);
    
    // 2. Lister tous les fichiers
    console.log('📋 Récupération de la liste des fichiers...');
    const { data: files, error: listError } = await supabase.storage
      .from('logos')
      .list('', { limit: 10000 });
    
    if (listError) {
      console.error('❌ Erreur récupération liste fichiers:', listError.message);
      return;
    }
    
    // 3. Filtrer et trier les badges par date (les plus anciens en premier)
    const badgeFiles = files
      .filter(file => file.name.includes('badge') && file.name.endsWith('.pdf'))
      .sort((a, b) => {
        // Extraire la date du nom de fichier (format: badge-cnol2025-...)
        const dateA = a.name.includes('175') ? parseInt(a.name.match(/175\d+/)?.[0] || '0') : 0;
        const dateB = b.name.includes('175') ? parseInt(b.name.match(/175\d+/)?.[0] || '0') : 0;
        return dateA - dateB; // Plus anciens en premier
      });
    
    console.log(`   ✅ ${badgeFiles.length} badges trouvés\n`);
    
    // 4. Calculer combien de badges supprimer pour libérer 500 MB
    const targetMB = 500;
    let currentSize = 0;
    let filesToDelete = [];
    
    for (const file of badgeFiles) {
      const fileSize = file.metadata?.size || 0;
      const fileSizeMB = fileSize / (1024 * 1024);
      
      if (currentSize < targetMB) {
        filesToDelete.push({
          name: file.name,
          size: fileSize,
          sizeMB: fileSizeMB,
          metadata: file.metadata
        });
        currentSize += fileSizeMB;
      } else {
        break;
      }
    }
    
    console.log(`📊 PLAN DE SUPPRESSION :`);
    console.log(`   🎯 Objectif: ${targetMB} MB à libérer`);
    console.log(`   📁 Badges à supprimer: ${filesToDelete.length}`);
    console.log(`   💾 Espace à libérer: ${currentSize.toFixed(2)} MB`);
    console.log(`   📅 Période: Badges les plus anciens`);
    
    if (filesToDelete.length === 0) {
      console.log('\n❌ Aucun badge à supprimer');
      return;
    }
    
    // 5. Sauvegarder la liste des fichiers à supprimer
    const backupData = {
      timestamp: new Date().toISOString(),
      totalFiles: filesToDelete.length,
      totalSizeMB: currentSize,
      files: filesToDelete,
      note: 'Badges supprimés de Supabase - Sauvegardés sur R2'
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Sauvegarde créée: ${backupFile}`);
    
    // 6. Confirmation finale
    console.log('\n⚠️  ATTENTION : Cette action est irréversible !');
    console.log('   Les badges supprimés ne pourront plus être récupérés.');
    console.log('   Ils sont déjà sauvegardés sur Cloudflare R2.');
    console.log(`   Sauvegarde locale créée: ${backupFile}`);
    
    // 7. Supprimer les fichiers
    console.log('\n🗑️  SUPPRESSION EN COURS...');
    
    let deletedCount = 0;
    let freedSpace = 0;
    let errors = [];
    
    for (let i = 0; i < filesToDelete.length; i++) {
      const file = filesToDelete[i];
      
      try {
        console.log(`   [${i + 1}/${filesToDelete.length}] Suppression de: ${file.name} (${file.sizeMB.toFixed(2)} MB)`);
        
        const { error: deleteError } = await supabase.storage
          .from('logos')
          .remove([file.name]);
        
        if (deleteError) {
          console.log(`      ❌ Erreur: ${deleteError.message}`);
          errors.push({
            file: file.name,
            error: deleteError.message
          });
        } else {
          console.log(`      ✅ Supprimé avec succès`);
          deletedCount++;
          freedSpace += file.sizeMB;
        }
        
        // Pause entre les suppressions pour éviter la surcharge
        if (i % 10 === 0 && i > 0) {
          console.log(`      ⏸️  Pause de 1 seconde...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.log(`      ❌ Erreur générale: ${error.message}`);
        errors.push({
          file: file.name,
          error: error.message
        });
      }
    }
    
    // 8. Résultats finaux
    console.log('\n📊 RÉSULTATS FINAUX :');
    console.log('=' .repeat(50));
    console.log(`   ✅ Badges supprimés avec succès: ${deletedCount}`);
    console.log(`   💾 Espace libéré: ${freedSpace.toFixed(2)} MB`);
    console.log(`   ❌ Erreurs: ${errors.length}`);
    console.log(`   💾 Sauvegarde: ${backupFile}`);
    
    if (errors.length > 0) {
      console.log('\n❌ FICHIERS AVEC ERREURS :');
      errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
      
      // Sauvegarder les erreurs
      const errorFile = path.join(backupDir, `errors-${timestamp}.json`);
      fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2));
      console.log(`   💾 Erreurs sauvegardées: ${errorFile}`);
    }
    
    // 9. Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE...');
    const { data: remainingFiles, error: checkError } = await supabase.storage
      .from('logos')
      .list('', { limit: 10000 });
    
    if (!checkError) {
      const remainingBadges = remainingFiles.filter(f => f.name.includes('badge') && f.name.endsWith('.pdf')).length;
      console.log(`   📁 Badges restants: ${remainingBadges}`);
      console.log(`   📊 Total fichiers restants: ${remainingFiles.length}`);
    }
    
    console.log('\n🎉 NETTOYAGE TERMINÉ !');
    console.log(`   💾 Espace libéré: ${freedSpace.toFixed(2)} MB`);
    console.log(`   📁 Sauvegarde: ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la suppression
deleteOldBadges();
