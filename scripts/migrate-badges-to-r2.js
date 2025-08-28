// Script pour migrer tous les badges vers R2 et mettre à jour les URLs
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configuration Supabase (pour la base de données)
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration R2
const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com';
const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cnol';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

// Nouvelle URL publique R2
const newR2PublicUrl = 'https://pub-fdeb8c312cab4d4bb5abbe51803382ab.r2.dev';

// Client R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

async function migrateBadgesToR2() {
  console.log('🚀 MIGRATION DES BADGES VERS R2...\n');
  
  if (!r2AccessKeyId || !r2SecretAccessKey) {
    console.error('❌ Variables R2 manquantes !');
    console.log('   Vérifiez votre fichier .env');
    process.exit(1);
  }

  try {
    // 1. Lister tous les badges sur Supabase
    console.log('📋 ÉTAPE 1: Récupération de la liste des badges...');
    
    const { data: files, error: listError } = await supabase.storage
      .from('logos')
      .list('', { limit: 10000 });

    if (listError) {
      console.error('❌ Erreur récupération liste fichiers:', listError.message);
      return;
    }

    // Filtrer les badges
    const badgeFiles = files.filter(file => 
      file.name.includes('badge') && file.name.endsWith('.pdf')
    );

    console.log(`   ✅ ${badgeFiles.length} badges trouvés sur Supabase\n`);

    if (badgeFiles.length === 0) {
      console.log('ℹ️  Aucun badge à migrer');
      return;
    }

    // 2. Créer un dossier de sauvegarde
    const backupDir = path.join(__dirname, '../backup-badges-migration');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `badges-migration-${timestamp}.json`);

    // 3. Migrer les badges vers R2
    console.log('🔄 ÉTAPE 2: Migration des badges vers R2...');
    
    let migratedCount = 0;
    let errors = [];
    const migrationResults = [];

    for (let i = 0; i < badgeFiles.length; i++) {
      const file = badgeFiles[i];
      
      try {
        console.log(`   [${i + 1}/${badgeFiles.length}] Migration de: ${file.name}`);
        
        // Télécharger le fichier depuis Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('logos')
          .download(file.name);

        if (downloadError) {
          console.log(`      ❌ Erreur téléchargement: ${downloadError.message}`);
          errors.push({ file: file.name, error: downloadError.message });
          continue;
        }

        // Convertir en buffer
        const fileBuffer = Buffer.from(await fileData.arrayBuffer());

        // Upload vers R2
        const command = new PutObjectCommand({
          Bucket: r2Bucket,
          Key: file.name,
          Body: fileBuffer,
          ContentType: 'application/pdf',
          ACL: 'public-read',
        });

        await r2Client.send(command);
        
        // Nouvelle URL R2
        const newUrl = `${newR2PublicUrl}/${file.name}`;
        
        console.log(`      ✅ Migré vers R2: ${newUrl}`);
        
        migratedCount++;
        migrationResults.push({
          fileName: file.name,
          oldUrl: `https://otmttpiqeehfquoqycol.supabase.co/storage/v1/object/public/logos/${file.name}`,
          newUrl: newUrl,
          size: file.metadata?.size || 0
        });

        // Pause pour éviter la surcharge
        if (i % 10 === 0 && i > 0) {
          console.log(`      ⏸️  Pause de 1 seconde...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.log(`      ❌ Erreur migration: ${error.message}`);
        errors.push({ file: file.name, error: error.message });
      }
    }

    // 4. Sauvegarder les résultats
    const backupData = {
      timestamp: new Date().toISOString(),
      totalBadges: badgeFiles.length,
      migratedCount,
      errors: errors.length,
      results: migrationResults,
      note: 'Migration des badges de Supabase vers R2'
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    // 5. Résumé
    console.log('\n📊 RÉSUMÉ DE LA MIGRATION :');
    console.log('=' .repeat(50));
    console.log(`   📁 Total badges: ${badgeFiles.length}`);
    console.log(`   ✅ Migrés avec succès: ${migratedCount}`);
    console.log(`   ❌ Erreurs: ${errors.length}`);
    console.log(`   💾 Sauvegarde: ${backupFile}`);

    if (errors.length > 0) {
      console.log('\n❌ ERREURS RENCONTRÉES :');
      errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
      
      if (errors.length > 5) {
        console.log(`   ... et ${errors.length - 5} autres erreurs`);
      }
    }

    // 6. Prochaines étapes
    console.log('\n🎯 PROCHAINES ÉTAPES :');
    console.log('   1. ✅ Badges migrés vers R2');
    console.log('   2. 🔧 Mettre à jour les APIs de génération de badges');
    console.log('   3. 🚀 Tester la génération de nouveaux badges');
    console.log('   4. ✅ Confirmer que tous les liens fonctionnent');

    console.log('\n💡 FICHIERS À MODIFIER POUR LES BADGES :');
    console.log('   - pages/api/whatsapp/generate-badge.js');
    console.log('   - pages/api/validate.js');
    console.log('   - pages/api/validate-whatsapp.js');
    console.log('   - pages/api/generatedbadge.js');
    console.log('   - pages/api/generatedbadge-unified.js');

    console.log('\n🎉 MIGRATION DES BADGES TERMINÉE !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la migration
migrateBadgesToR2();
