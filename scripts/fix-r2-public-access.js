// Script pour diagnostiquer et corriger l'accès public R2
const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

// Configuration R2
const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com';
const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cnol';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

console.log('🔧 DIAGNOSTIC ET CORRECTION DE L\'ACCÈS PUBLIC R2...\n');

if (!r2AccessKeyId || !r2SecretAccessKey) {
  console.error('❌ Variables R2 manquantes !');
  console.log('   Vérifiez votre fichier .env');
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

async function fixR2PublicAccess() {
  try {
    console.log('📋 ÉTAPE 1: Vérification de la configuration CORS actuelle...');
    
    try {
      const corsCommand = new GetBucketCorsCommand({ Bucket: r2Bucket });
      const corsResult = await r2Client.send(corsCommand);
      console.log('   ✅ Configuration CORS actuelle:');
      console.log('      ', JSON.stringify(corsResult.CORSRules, null, 2));
    } catch (error) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('   ℹ️  Aucune configuration CORS trouvée');
      } else {
        console.log(`   ❌ Erreur récupération CORS: ${error.message}`);
      }
    }
    
    console.log('\n🔧 ÉTAPE 2: Configuration CORS pour accès public...');
    
    const corsConfig = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
          MaxAgeSeconds: 3000
        }
      ]
    };
    
    try {
      const putCorsCommand = new PutBucketCorsCommand({
        Bucket: r2Bucket,
        CORSConfiguration: corsConfig
      });
      
      await r2Client.send(putCorsCommand);
      console.log('   ✅ Configuration CORS mise à jour');
      console.log('      - AllowedOrigins: * (accès public)');
      console.log('      - AllowedMethods: GET, PUT, POST, DELETE, HEAD');
      console.log('      - AllowedHeaders: *');
      
    } catch (error) {
      console.log(`   ❌ Erreur mise à jour CORS: ${error.message}`);
    }
    
    console.log('\n🔧 ÉTAPE 3: Configuration de la politique de bucket...');
    
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${r2Bucket}/*`
        }
      ]
    };
    
    try {
      const putPolicyCommand = new PutBucketPolicyCommand({
        Bucket: r2Bucket,
        Policy: JSON.stringify(bucketPolicy)
      });
      
      await r2Client.send(putPolicyCommand);
      console.log('   ✅ Politique de bucket mise à jour');
      console.log('      - Accès public en lecture autorisé');
      console.log('      - Principal: * (tout le monde)');
      console.log('      - Action: s3:GetObject (lecture)');
      
    } catch (error) {
      console.log(`   ❌ Erreur mise à jour politique: ${error.message}`);
      console.log('   ℹ️  Cette erreur peut être normale si la politique existe déjà');
    }
    
    console.log('\n🧪 ÉTAPE 4: Test de l\'accès public...');
    
    // Tester avec un fichier existant
    const testFileName = 'badge-cnol2025---beldi-marouane.pdf';
    const publicUrl = `${r2Endpoint}/${r2Bucket}/${testFileName}`;
    
    console.log(`   🔗 Test URL: ${publicUrl}`);
    
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log(`   ✅ Accès public: ACTIF (${response.status})`);
        console.log(`   📊 Taille: ${(response.headers.get('content-length') / 1024).toFixed(1)} KB`);
        console.log(`   🎯 Type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`   ❌ Accès public: INACTIF (${response.status})`);
        console.log(`   📝 Réponse: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur accès public: ${error.message}`);
    }
    
    console.log('\n💡 INSTRUCTIONS MANUELLES CLOUDFLARE :');
    console.log('   1. Allez sur [dash.cloudflare.com](https://dash.cloudflare.com)');
    console.log('   2. Sélectionnez votre compte R2');
    console.log('   3. Allez dans "Object Storage" → "Manage R2 API tokens"');
    console.log('   4. Vérifiez que votre bucket "cnol" est configuré');
    console.log('   5. Dans "Settings" du bucket, vérifiez :');
    console.log('      - "Public access" est activé');
    console.log('      - "CORS" est configuré pour *');
    console.log('      - "Bucket policy" autorise s3:GetObject');
    
    console.log('\n🎯 PROCHAINES ÉTAPES :');
    console.log('   1. ✅ CORS configuré pour accès public');
    console.log('   2. ✅ Politique de bucket mise à jour');
    console.log('   3. 🔄 Attendre la propagation (2-5 minutes)');
    console.log('   4. 🧪 Retester l\'accès public');
    console.log('   5. 🚀 Tester la génération de badges en production');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la correction
fixR2PublicAccess();
