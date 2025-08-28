// Script pour vérifier l'état des fichiers sur Supabase après migration R2
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseStatus() {
  console.log('🔍 Vérification de l\'état des fichiers sur Supabase après migration R2...\n');
  
  try {
    // 1. Lister tous les fichiers dans le bucket Supabase 'logos'
    console.log('📋 Récupération de la liste des fichiers Supabase...');
    const { data: files, error: listError } = await supabase.storage
      .from('logos')
      .list('', { limit: 10000 });
    
    if (listError) {
      console.error('❌ Erreur récupération liste fichiers:', listError.message);
      return;
    }
    
    console.log(`   ✅ ${files.length} fichiers trouvés sur Supabase\n`);
    
    if (files.length === 0) {
      console.log('ℹ️  Aucun fichier sur Supabase - Migration complète !');
      return;
    }
    
    // 2. Catégoriser les fichiers
    const fileTypes = {
      badges: files.filter(f => f.name.includes('badge') && f.name.endsWith('.pdf')),
      tickets: files.filter(f => (f.name.includes('ticket') || f.name.includes('masterclass') || f.name.includes('atelier')) && f.name.endsWith('.pdf')),
      images: files.filter(f => f.name.endsWith('.jpg') || f.name.endsWith('.png') || f.name.endsWith('.jpeg')),
      logos: files.filter(f => f.name.includes('logo')),
      other: files.filter(f => !f.name.includes('badge') && !f.name.includes('ticket') && !f.name.includes('masterclass') && !f.name.includes('atelier') && !f.name.includes('logo') && !f.name.endsWith('.jpg') && !f.name.endsWith('.png') && !f.name.endsWith('.jpeg'))
    };
    
    console.log('📊 Répartition des fichiers restants sur Supabase :');
    Object.entries(fileTypes).forEach(([type, files]) => {
      if (files.length > 0) {
        console.log(`   - ${type}: ${files.length} fichiers`);
      }
    });
    
    // 3. Tester l'accessibilité de quelques fichiers
    console.log('\n🔗 Test d\'accessibilité des liens Supabase...');
    
    const testFiles = [
      ...fileTypes.badges.slice(0, 3),
      ...fileTypes.tickets.slice(0, 2),
      ...fileTypes.images.slice(0, 2)
    ];
    
    for (const file of testFiles) {
      try {
        const oldUrl = `https://otmttpiqeehfquoqycol.supabase.co/storage/v1/object/public/logos/${file.name}`;
        const newUrl = `https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com/cnol/${file.name}`;
        
        console.log(`\n   📁 ${file.name}`);
        console.log(`      Ancien lien Supabase: ${oldUrl}`);
        console.log(`      Nouveau lien R2: ${newUrl}`);
        
        // Test d'accès au fichier Supabase
        try {
          const response = await fetch(oldUrl);
          if (response.ok) {
            console.log(`      ✅ Lien Supabase: ACTIF (${response.status})`);
          } else {
            console.log(`      ❌ Lien Supabase: INACTIF (${response.status})`);
          }
        } catch (error) {
          console.log(`      ❌ Lien Supabase: ERREUR (${error.message})`);
        }
        
        // Test d'accès au fichier R2
        try {
          const response = await fetch(newUrl);
          if (response.ok) {
            console.log(`      ✅ Lien R2: ACTIF (${response.status})`);
          } else {
            console.log(`      ❌ Lien R2: INACTIF (${response.status})`);
          }
        } catch (error) {
          console.log(`      ❌ Lien R2: ERREUR (${error.message})`);
        }
        
      } catch (error) {
        console.log(`      ❌ Erreur test: ${error.message}`);
      }
    }
    
    // 4. Recommandations
    console.log('\n💡 RECOMMANDATIONS :');
    if (files.length > 0) {
      console.log('   - Les fichiers sont encore sur Supabase');
      console.log('   - Vérifiez que les liens Supabase fonctionnent encore');
      console.log('   - Considérez une redirection automatique vers R2');
      console.log('   - Ou supprimez les fichiers Supabase après validation R2');
    } else {
      console.log('   - Migration complète réussie !');
      console.log('   - Tous les fichiers sont maintenant sur R2');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la vérification
checkSupabaseStatus();
