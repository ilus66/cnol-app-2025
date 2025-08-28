// Script pour calculer l'espace utilisé sur Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateSupabaseSpace() {
  console.log('📊 Calcul de l\'espace utilisé sur Supabase...\n');
  
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
    
    console.log(`   ✅ ${files.length} fichiers trouvés\n`);
    
    // 2. Calculer l'espace total
    let totalSize = 0;
    const fileTypes = {
      badges: { count: 0, size: 0 },
      tickets: { count: 0, size: 0 },
      images: { count: 0, size: 0 },
      logos: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    };
    
    files.forEach(file => {
      const size = file.metadata?.size || 0;
      totalSize += size;
      
      if (file.name.includes('badge') && file.name.endsWith('.pdf')) {
        fileTypes.badges.count++;
        fileTypes.badges.size += size;
      } else if ((file.name.includes('ticket') || file.name.includes('masterclass') || file.name.includes('atelier')) && file.name.endsWith('.pdf')) {
        fileTypes.tickets.count++;
        fileTypes.tickets.size += size;
      } else if (file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.jpeg')) {
        fileTypes.images.count++;
        fileTypes.images.size += size;
      } else if (file.name.includes('logo')) {
        fileTypes.logos.count++;
        fileTypes.logos.size += size;
      } else {
        fileTypes.other.count++;
        fileTypes.other.size += size;
      }
    });
    
    // 3. Afficher le récapitulatif
    console.log('📊 RÉCAPITULATIF DE L\'ESPACE UTILISÉ :');
    console.log('=' .repeat(50));
    
    Object.entries(fileTypes).forEach(([type, data]) => {
      if (data.count > 0) {
        const sizeMB = (data.size / (1024 * 1024)).toFixed(2);
        console.log(`   ${type.toUpperCase()}:`);
        console.log(`      📁 Nombre: ${data.count} fichiers`);
        console.log(`      💾 Taille: ${sizeMB} MB`);
        console.log(`      📊 Moyenne: ${(data.size / data.count / 1024).toFixed(1)} KB par fichier`);
        console.log('');
      }
    });
    
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log('=' .repeat(50));
    console.log(`   🎯 TOTAL: ${totalSizeMB} MB (${files.length} fichiers)`);
    
    // 4. Recommandations pour libérer 500 MB
    console.log('\n💡 RECOMMANDATIONS POUR LIBÉRER 500 MB :');
    
    if (totalSizeMB >= 500) {
      const targetMB = 500;
      let freedMB = 0;
      const filesToDelete = [];
      
      // Priorité 1: Badges (les plus volumineux)
      if (fileTypes.badges.size > 0) {
        const badgesMB = (fileTypes.badges.size / (1024 * 1024));
        if (freedMB + badgesMB <= targetMB) {
          console.log(`   🗑️  Supprimer tous les badges: ${badgesMB.toFixed(2)} MB libérés`);
          freedMB += badgesMB;
          filesToDelete.push(...files.filter(f => f.name.includes('badge')));
        }
      }
      
      // Priorité 2: Images
      if (freedMB < targetMB && fileTypes.images.size > 0) {
        const imagesMB = (fileTypes.images.size / (1024 * 1024));
        if (freedMB + imagesMB <= targetMB) {
          console.log(`   🗑️  Supprimer toutes les images: ${imagesMB.toFixed(2)} MB libérés`);
          freedMB += imagesMB;
          filesToDelete.push(...files.filter(f => f.name.endsWith('.jpg') || f.name.endsWith('.png') || f.name.endsWith('.jpeg')));
        }
      }
      
      // Priorité 3: Logos
      if (freedMB < targetMB && fileTypes.logos.size > 0) {
        const logosMB = (fileTypes.logos.size / (1024 * 1024));
        if (freedMB + logosMB <= targetMB) {
          console.log(`   🗑️  Supprimer tous les logos: ${logosMB.toFixed(2)} MB libérés`);
          freedMB += logosMB;
          filesToDelete.push(...files.filter(f => f.name.includes('logo')));
        }
      }
      
      console.log(`\n   🎯 Espace total à libérer: ${freedMB.toFixed(2)} MB`);
      console.log(`   📁 Fichiers à supprimer: ${filesToDelete.length}`);
      
      if (freedMB >= targetMB) {
        console.log('   ✅ Objectif 500 MB atteint !');
      } else {
        console.log(`   ⚠️  Il manque ${(targetMB - freedMB).toFixed(2)} MB`);
      }
      
    } else {
      console.log('   ℹ️  Espace insuffisant pour libérer 500 MB');
      console.log(`   📊 Espace disponible: ${totalSizeMB} MB`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer le calcul
calculateSupabaseSpace();
