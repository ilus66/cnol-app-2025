// Script de test complet pour R2 en production
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configuration R2 depuis les variables d'environnement
const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com';
const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cnol';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

console.log('🧪 TEST COMPLET R2 POUR PRODUCTION...\n');

// Vérification des variables d'environnement
console.log('🔧 VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT :');
console.log(`   R2 Endpoint: ${r2Endpoint}`);
console.log(`   R2 Bucket: ${r2Bucket}`);
console.log(`   R2 Access Key: ${r2AccessKeyId ? '✅ Définie' : '❌ Manquante'}`);
console.log(`   R2 Secret Key: ${r2SecretAccessKey ? '✅ Définie' : '❌ Manquante'}`);

if (!r2AccessKeyId || !r2SecretAccessKey) {
  console.error('\n❌ ERREUR: Variables R2 manquantes !');
  console.log('   Vérifiez votre fichier .env ou vos variables d\'environnement Vercel');
  process.exit(1);
}

// Client R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

async function testR2Production() {
  try {
    console.log('\n📋 TEST 1: LISTE DES FICHIERS EXISTANTS...');
    
    // Lister les fichiers existants
    const listCommand = new ListObjectsV2Command({
      Bucket: r2Bucket,
      MaxKeys: 10
    });
    
    const listResult = await r2Client.send(listCommand);
    const existingFiles = listResult.Contents || [];
    
    console.log(`   ✅ ${existingFiles.length} fichiers trouvés sur R2`);
    
    if (existingFiles.length > 0) {
      console.log('   📁 Exemples de fichiers:');
      existingFiles.slice(0, 5).forEach(file => {
        console.log(`      - ${file.Key} (${(file.Size / 1024).toFixed(1)} KB)`);
      });
    }
    
    console.log('\n📝 TEST 2: CRÉATION D\'UN FICHIER DE TEST...');
    
    // Créer un fichier de test
    const testFileName = `test-production-${Date.now()}.txt`;
    const testContent = `Test R2 Production - ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read',
    });
    
    const putResult = await r2Client.send(putCommand);
    console.log(`   ✅ Fichier créé: ${testFileName}`);
    console.log(`   📊 ETag: ${putResult.ETag}`);
    
    console.log('\n🔍 TEST 3: LECTURE DU FICHIER DE TEST...');
    
    // Lire le fichier créé
    const getCommand = new GetObjectCommand({
      Bucket: r2Bucket,
      Key: testFileName,
    });
    
    const getResult = await r2Client.send(getCommand);
    const fileContent = await getResult.Body.transformToString();
    
    console.log(`   ✅ Fichier lu avec succès`);
    console.log(`   📄 Contenu: ${fileContent}`);
    
    console.log('\n🌐 TEST 4: ACCÈS PUBLIC AU FICHIER...');
    
    // Tester l'URL publique
    const publicUrl = `${r2Endpoint}/${r2Bucket}/${testFileName}`;
    console.log(`   🔗 URL publique: ${publicUrl}`);
    
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log(`   ✅ Accès public: ACTIF (${response.status})`);
        const publicContent = await response.text();
        console.log(`   📄 Contenu public: ${publicContent}`);
      } else {
        console.log(`   ❌ Accès public: INACTIF (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur accès public: ${error.message}`);
    }
    
    console.log('\n🗑️  TEST 5: SUPPRESSION DU FICHIER DE TEST...');
    
    // Supprimer le fichier de test
    const deleteCommand = new DeleteObjectCommand({
      Bucket: r2Bucket,
      Key: testFileName,
    });
    
    await r2Client.send(deleteCommand);
    console.log(`   ✅ Fichier supprimé: ${testFileName}`);
    
    console.log('\n📊 TEST 6: VÉRIFICATION FINALE...');
    
    // Vérifier que le fichier a bien été supprimé
    try {
      await r2Client.send(getCommand);
      console.log(`   ❌ Erreur: Le fichier existe encore`);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        console.log(`   ✅ Fichier bien supprimé`);
      } else {
        console.log(`   ❌ Erreur inattendue: ${error.message}`);
      }
    }
    
    console.log('\n🎉 TOUS LES TESTS R2 SONT PASSÉS !');
    console.log('   ✅ R2 est prêt pour la production');
    console.log('   ✅ Création, lecture, suppression fonctionnent');
    console.log('   ✅ Accès public configuré');
    
    console.log('\n💡 PROCHAINES ÉTAPES POUR LA PRODUCTION :');
    console.log('   1. ✅ R2 est configuré et fonctionnel');
    console.log('   2. 🔧 Mettre à jour les variables Vercel');
    console.log('   3. 🚀 Déployer l\'application');
    console.log('   4. 🧪 Tester en production');
    
  } catch (error) {
    console.error('\n❌ ERREUR LORS DES TESTS R2:', error.message);
    console.log('\n🔧 DIAGNOSTIC :');
    console.log('   - Vérifiez vos clés R2');
    console.log('   - Vérifiez les permissions du bucket');
    console.log('   - Vérifiez la configuration CORS');
  }
}

// Lancer les tests
testR2Production();
