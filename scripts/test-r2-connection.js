// Script de test de connexion Cloudflare R2
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuration R2
const r2Endpoint = 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com';
const r2Bucket = 'cnol';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

if (!r2AccessKeyId || !r2SecretAccessKey) {
  console.error('❌ Variables d\'environnement R2 manquantes !');
  console.error('   CLOUDFLARE_R2_ACCESS_KEY_ID et CLOUDFLARE_R2_SECRET_ACCESS_KEY sont requis');
  console.error('\n💡 Pour tester, définissez ces variables :');
  console.error('   export CLOUDFLARE_R2_ACCESS_KEY_ID="your_key"');
  console.error('   export CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret"');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

async function testR2Connection() {
  console.log('🔍 Test de connexion Cloudflare R2...\n');
  
  try {
    // 1. Test de lecture du bucket
    console.log('📋 Test 1: Lecture du bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: r2Bucket,
      MaxKeys: 5
    });
    
    const listResult = await r2Client.send(listCommand);
    console.log(`   ✅ Connexion OK - Bucket accessible`);
    console.log(`   📁 Fichiers dans le bucket: ${listResult.Contents?.length || 0}`);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('   📄 Exemples de fichiers:');
      listResult.Contents.slice(0, 3).forEach(file => {
        console.log(`      - ${file.Key} (${file.Size} bytes)`);
      });
    }
    
    // 2. Test d'écriture (fichier de test)
    console.log('\n📝 Test 2: Écriture d\'un fichier de test...');
    const testFileName = `test-connection-${Date.now()}.txt`;
    const testContent = 'Test de connexion R2 - ' + new Date().toISOString();
    
    const putCommand = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read',
    });
    
    const putResult = await r2Client.send(putCommand);
    console.log(`   ✅ Écriture OK - Fichier créé: ${testFileName}`);
    console.log(`   🏷️  ETag: ${putResult.ETag}`);
    
    // 3. Construire l'URL publique
    const publicUrl = `${r2Endpoint}/${r2Bucket}/${testFileName}`;
    console.log(`   🌐 URL publique: ${publicUrl}`);
    
    // 4. Test de suppression (nettoyage)
    console.log('\n🗑️  Test 3: Nettoyage du fichier de test...');
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: r2Bucket,
      Key: testFileName,
    });
    
    await r2Client.send(deleteCommand);
    console.log(`   ✅ Suppression OK - Fichier de test supprimé`);
    
    // 5. Résumé final
    console.log('\n🎉 TOUS LES TESTS R2 SONT OK !');
    console.log('📊 Résumé:');
    console.log(`   ✅ Lecture du bucket: OK`);
    console.log(`   ✅ Écriture de fichiers: OK`);
    console.log(`   ✅ Suppression de fichiers: OK`);
    console.log(`   ✅ URLs publiques: OK`);
    console.log('\n🚀 Vous pouvez maintenant lancer la migration !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test R2:', error.message);
    console.error('\n🔧 Vérifiez :');
    console.error('   1. Vos clés d\'accès R2 sont correctes');
    console.error('   2. Le bucket "cnol" existe');
    console.error('   3. Vos permissions sont suffisantes');
    console.error('   4. L\'endpoint R2 est accessible');
  }
}

testR2Connection();
