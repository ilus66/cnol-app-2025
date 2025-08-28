// Script de migration complète de Supabase Storage vers Cloudflare R2
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuration Supabase (source)
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

// Configuration Cloudflare R2 (destination)
const r2Endpoint = 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com';
const r2Bucket = 'cnol';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

if (!r2AccessKeyId || !r2SecretAccessKey) {
  console.error('❌ Variables d\'environnement R2 manquantes !');
  console.error('   CLOUDFLARE_R2_ACCESS_KEY_ID et CLOUDFLARE_R2_SECRET_ACCESS_KEY sont requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

// Catégoriser les fichiers par type
function categorizeFile(fileName) {
  if (fileName.includes('badge')) return 'badge';
  if (fileName.includes('ticket') || fileName.includes('masterclass') || fileName.includes('atelier')) return 'ticket';
  if (fileName.includes('logo')) return 'logo';
  if (fileName.includes('image') || fileName.includes('.jpg') || fileName.includes('.png')) return 'image';
  return 'other';
}

async function migrateAllToR2() {
  console.log('🚀 Début de la migration complète vers Cloudflare R2...\n');
  
  let totalFiles = 0;
  let migratedFiles = 0;
  let errors = 0;
  const migrationLog = [];
  const stats = {
    badges: 0,
    tickets: 0,
    logos: 0,
    images: 0,
    other: 0
  };
  
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
    
    // Filtrer seulement les fichiers PDF et images
    const validFiles = files.filter(file => 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.jpg') || 
      file.name.endsWith('.png') ||
      file.name.endsWith('.jpeg')
    );
    
    console.log(`   ✅ ${validFiles.length} fichiers valides trouvés dans Supabase\n`);
    
    if (validFiles.length === 0) {
      console.log('ℹ️  Aucun fichier à migrer');
      return;
    }
    
    // 2. Afficher le récapitulatif par type
    console.log('📊 Répartition des fichiers par type :');
    validFiles.forEach(file => {
      const type = categorizeFile(file.name);
      stats[type]++;
    });
    
    Object.entries(stats).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   - ${type}: ${count} fichiers`);
      }
    });
    console.log('');
    
    // 3. Migrer chaque fichier
    console.log('🔄 Migration des fichiers vers R2...\n');
    
    for (const file of validFiles) {
      try {
        totalFiles++;
        const fileType = categorizeFile(file.name);
        const contentType = file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        
        console.log(`   [${totalFiles}/${validFiles.length}] Migration de: ${file.name} (${fileType})`);
        
        // Télécharger le fichier depuis Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('logos')
          .download(file.name);
        
        if (downloadError) {
          console.error(`     ❌ Erreur téléchargement: ${downloadError.message}`);
          errors++;
          continue;
        }
        
        // Convertir en buffer
        const fileBuffer = Buffer.from(await fileData.arrayBuffer());
        
        // Upload vers R2
        const command = new PutObjectCommand({
          Bucket: r2Bucket,
          Key: file.name,
          Body: fileBuffer,
          ContentType: contentType,
          ACL: 'public-read',
        });
        
        const uploadResult = await r2Client.send(command);
        
        // Construire la nouvelle URL
        const newUrl = `${r2Endpoint}/${r2Bucket}/${file.name}`;
        
        // Enregistrer le succès
        migratedFiles++;
        migrationLog.push({
          fileName: file.name,
          fileType: fileType,
          oldUrl: `https://otmttpiqeehfquoqycol.supabase.co/storage/v1/object/public/logos/${file.name}`,
          newUrl: newUrl,
          status: 'success',
          etag: uploadResult.ETag,
          size: file.size,
          contentType: contentType
        });
        
        console.log(`     ✅ Migré avec succès vers R2`);
        console.log(`        Type: ${fileType} | Taille: ${(file.size / 1024).toFixed(1)} KB`);
        console.log(`        Nouvelle URL: ${newUrl}`);
        
      } catch (error) {
        console.error(`     ❌ Erreur migration: ${error.message}`);
        errors++;
        migrationLog.push({
          fileName: file.name,
          fileType: categorizeFile(file.name),
          status: 'error',
          error: error.message
        });
      }
    }
    
    // 4. Résumé de la migration
    console.log('\n🎉 Migration complète terminée !');
    console.log('📊 Résumé:');
    console.log(`   - Total fichiers: ${totalFiles}`);
    console.log(`   - Migrés avec succès: ${migratedFiles}`);
    console.log(`   - Erreurs: ${errors}`);
    console.log('\n📁 Répartition finale:');
    Object.entries(stats).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   - ${type}: ${count} fichiers`);
      }
    });
    
    // 5. Sauvegarder le log de migration
    const fs = require('fs');
    const logFileName = `migration-complete-r2-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(logFileName, JSON.stringify(migrationLog, null, 2));
    console.log(`\n📝 Log de migration sauvegardé: ${logFileName}`);
    
    // 6. Instructions pour la suite
    console.log('\n🔧 PROCHAINES ÉTAPES:');
    console.log('   1. Mettre à jour les variables d\'environnement');
    console.log('   2. Modifier le code pour utiliser R2 au lieu de Supabase');
    console.log('   3. Tester les nouveaux uploads');
    console.log('   4. Mettre à jour les URLs dans la base de données');
    console.log('   5. Vérifier que tous les fichiers sont accessibles');
    
    if (errors > 0) {
      console.log(`\n⚠️  ${errors} erreurs rencontrées. Vérifiez le log pour plus de détails.`);
    }
    
    // 7. Estimation des économies
    const totalSizeMB = migrationLog.reduce((sum, file) => sum + (file.size || 0), 0) / (1024 * 1024);
    console.log(`\n💰 Estimation des économies:`);
    console.log(`   - Taille totale migrée: ${totalSizeMB.toFixed(2)} MB`);
    console.log(`   - Économies de stockage: Quota illimité (vs quota Supabase)`);
    console.log(`   - Coût R2: ~${(totalSizeMB * 0.015 / 1024).toFixed(4)}$/mois`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la migration
migrateAllToR2();
