// Script de migration des tickets de Supabase Storage vers Cloudflare R2
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

async function migrateTicketsToR2() {
  console.log('🚀 Début de la migration des tickets vers Cloudflare R2...\n');
  
  let totalFiles = 0;
  let migratedFiles = 0;
  let errors = 0;
  const migrationLog = [];
  
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
    
    // Filtrer seulement les tickets PDF (pas les badges)
    const ticketFiles = files.filter(file => 
      (file.name.includes('ticket') || file.name.includes('masterclass') || file.name.includes('atelier')) 
      && file.name.endsWith('.pdf')
    );
    
    console.log(`   ✅ ${ticketFiles.length} tickets trouvés dans Supabase\n`);
    
    if (ticketFiles.length === 0) {
      console.log('ℹ️  Aucun ticket à migrer');
      return;
    }
    
    // 2. Migrer chaque fichier
    console.log('🔄 Migration des tickets vers R2...\n');
    
    for (const file of ticketFiles) {
      try {
        totalFiles++;
        console.log(`   [${totalFiles}/${ticketFiles.length}] Migration de: ${file.name}`);
        
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
          ContentType: 'application/pdf',
          ACL: 'public-read',
        });
        
        const uploadResult = await r2Client.send(command);
        
        // Construire la nouvelle URL
        const newUrl = `${r2Endpoint}/${r2Bucket}/${file.name}`;
        
        // Enregistrer le succès
        migratedFiles++;
        migrationLog.push({
          fileName: file.name,
          oldUrl: `https://otmttpiqeehfquoqycol.supabase.co/storage/v1/object/public/logos/${file.name}`,
          newUrl: newUrl,
          status: 'success',
          etag: uploadResult.ETag,
          type: 'ticket'
        });
        
        console.log(`     ✅ Migré avec succès vers R2`);
        console.log(`        Nouvelle URL: ${newUrl}`);
        
      } catch (error) {
        console.error(`     ❌ Erreur migration: ${error.message}`);
        errors++;
        migrationLog.push({
          fileName: file.name,
          status: 'error',
          error: error.message,
          type: 'ticket'
        });
      }
    }
    
    // 3. Résumé de la migration
    console.log('\n🎉 Migration des tickets terminée !');
    console.log('📊 Résumé:');
    console.log(`   - Total tickets: ${totalFiles}`);
    console.log(`   - Migrés avec succès: ${migratedFiles}`);
    console.log(`   - Erreurs: ${errors}`);
    
    // 4. Sauvegarder le log de migration
    const fs = require('fs');
    const logFileName = `migration-tickets-r2-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(logFileName, JSON.stringify(migrationLog, null, 2));
    console.log(`\n📝 Log de migration sauvegardé: ${logFileName}`);
    
    // 5. Instructions pour la suite
    console.log('\n🔧 PROCHAINES ÉTAPES:');
    console.log('   1. Mettre à jour le code pour utiliser R2');
    console.log('   2. Tester l\'envoi de nouveaux tickets');
    console.log('   3. Mettre à jour les URLs dans la base de données');
    
    if (errors > 0) {
      console.log(`\n⚠️  ${errors} erreurs rencontrées. Vérifiez le log pour plus de détails.`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la migration
migrateTicketsToR2();
