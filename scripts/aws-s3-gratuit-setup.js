/**
 * 🎁 AWS S3 - Configuration GRATUITE (12 mois)
 * Guide étape par étape pour profiter de la période gratuite
 */

console.log('🎁 AWS S3 - Configuration GRATUITE (12 mois)');
console.log('=============================================\n');

/**
 * Étapes détaillées pour la configuration AWS S3 gratuite
 */
function showSetupSteps() {
  console.log('📋 ÉTAPES DE CONFIGURATION AWS S3 GRATUIT');
  console.log('=========================================\n');
  
  console.log('🎯 AVANTAGES PÉRIODE GRATUITE:');
  console.log('• ✅ 12 MOIS gratuits (pas 6 mois)');
  console.log('• ✅ 5 GB de stockage S3 Standard/mois');
  console.log('• ✅ 20,000 requêtes GET/mois'); 
  console.log('• ✅ 2,000 requêtes PUT/mois');
  console.log('• ✅ 15 GB de transfert sortant/mois');
  console.log('• ✅ Votre usage (1.096 GB) est largement couvert !\n');

  console.log('🔧 ÉTAPE 1: Créer un compte AWS');
  console.log('===============================');
  console.log('1. Aller sur https://aws.amazon.com');
  console.log('2. Cliquer "Créer un compte AWS"');
  console.log('3. Saisir email et mot de passe');
  console.log('4. Choisir "Personnel" comme type de compte');
  console.log('5. Ajouter une carte bancaire (pas de débit pour niveau gratuit)');
  console.log('6. Vérifier le téléphone');
  console.log('7. Choisir le plan "Support de base" (gratuit)\n');

  console.log('🪣 ÉTAPE 2: Créer un bucket S3');
  console.log('==============================');
  console.log('1. Aller dans la console AWS');
  console.log('2. Rechercher "S3" dans les services');
  console.log('3. Cliquer "Créer un compartiment"');
  console.log('4. Nom du bucket: "cnol-badges-storage-[votre-nom]"');
  console.log('5. Région: "Europe (Paris) eu-west-3" (recommandé)');
  console.log('6. Laisser les paramètres par défaut');
  console.log('7. Cliquer "Créer un compartiment"\n');

  console.log('🔑 ÉTAPE 3: Créer les clés d\'accès');
  console.log('==================================');
  console.log('1. Aller dans "IAM" (Identity and Access Management)');
  console.log('2. Cliquer "Utilisateurs" dans le menu gauche');
  console.log('3. Cliquer "Créer un utilisateur"');
  console.log('4. Nom: "cnol-s3-user"');
  console.log('5. Cocher "Accès par clé d\'accès - Accès par programmation"');
  console.log('6. Permissions: "Attacher des stratégies existantes"');
  console.log('7. Rechercher et sélectionner "AmazonS3FullAccess"');
  console.log('8. Cliquer "Suivant" puis "Créer un utilisateur"');
  console.log('9. ⚠️ SAUVEGARDER les clés Access Key ID et Secret Access Key\n');

  console.log('⚙️ ÉTAPE 4: Configuration du projet');
  console.log('===================================');
  console.log('Créer un fichier .env.local avec:');
  console.log('```');
  console.log('AWS_ACCESS_KEY_ID=votre_access_key_id');
  console.log('AWS_SECRET_ACCESS_KEY=votre_secret_access_key');
  console.log('AWS_BUCKET_NAME=votre-nom-bucket');
  console.log('AWS_REGION=eu-west-3');
  console.log('```\n');

  console.log('📦 ÉTAPE 5: Installation des dépendances');
  console.log('========================================');
  console.log('npm install aws-sdk\n');

  console.log('🚀 ÉTAPE 6: Test de la configuration');
  console.log('====================================');
  console.log('node scripts/test-aws-s3-connection.js\n');

  console.log('📊 ÉTAPE 7: Migration des badges');
  console.log('================================');
  console.log('node scripts/migrate-to-aws-s3.js\n');

  console.log('🎊 RÉSULTAT ATTENDU:');
  console.log('====================');
  console.log('• ✅ 987 badges migrés vers AWS S3');
  console.log('• ✅ Économie immédiate: 21.92$/mois');
  console.log('• ✅ Stockage GRATUIT pendant 12 mois');
  console.log('• ✅ Design original préservé');
  console.log('• ✅ Performance identique ou meilleure\n');
}

/**
 * Code de test de connexion AWS S3
 */
function generateTestScript() {
  const testCode = `
/**
 * Test de connexion AWS S3
 */
require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');

// Configuration AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function testS3Connection() {
  console.log('🧪 Test de connexion AWS S3...');
  
  try {
    // 1. Lister les buckets
    const buckets = await s3.listBuckets().promise();
    console.log('✅ Connexion AWS réussie !');
    console.log('📁 Buckets disponibles:', buckets.Buckets.map(b => b.Name));
    
    // 2. Vérifier le bucket cible
    const bucketName = process.env.AWS_BUCKET_NAME;
    const bucketExists = buckets.Buckets.find(b => b.Name === bucketName);
    
    if (bucketExists) {
      console.log(\`✅ Bucket "\${bucketName}" trouvé !\`);
      
      // 3. Test d'upload simple
      const testFile = Buffer.from('Test CNOL 2025');
      await s3.upload({
        Bucket: bucketName,
        Key: 'test-cnol-connection.txt',
        Body: testFile
      }).promise();
      
      console.log('✅ Test d\\'upload réussi !');
      
      // 4. Nettoyer le fichier test
      await s3.deleteObject({
        Bucket: bucketName,
        Key: 'test-cnol-connection.txt'
      }).promise();
      
      console.log('✅ Test complet ! AWS S3 est prêt pour la migration.');
      
    } else {
      console.log(\`❌ Bucket "\${bucketName}" non trouvé.\`);
      console.log('📋 Créez le bucket dans la console AWS S3');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion AWS:', error.message);
    console.log('🔍 Vérifiez vos clés AWS dans .env.local');
  }
}

testS3Connection();
`;

  return testCode;
}

/**
 * Code de migration vers AWS S3
 */
function generateMigrationScript() {
  const migrationCode = `
/**
 * Migration des badges vers AWS S3 (GRATUIT 12 mois)
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const AWS = require('aws-sdk');

// Configuration Supabase
const supabase = createClient(
  'https://otmttpiqeehfquoqycol.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM'
);

// Configuration AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function migrateBadgesToAWS() {
  console.log('🚀 Migration badges vers AWS S3 (GRATUIT 12 mois)');
  console.log('================================================');
  
  try {
    // 1. Lister tous les badges
    const { data: files, error } = await supabase.storage
      .from('logos')
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('❌ Erreur listing Supabase:', error);
      return;
    }
    
    const badges = files.filter(f => 
      f.name.endsWith('.pdf') && 
      f.name.includes('badge-cnol2025')
    );
    
    console.log(\`📁 \${badges.length} badges à migrer\`);
    
    let migrated = 0;
    let errors = 0;
    let totalSize = 0;
    
    for (const badge of badges) {
      try {
        console.log(\`🔄 Migration: \${badge.name}\`);
        
        // 2. Télécharger depuis Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('logos')
          .download(badge.name);
        
        if (downloadError) {
          console.error(\`❌ Erreur download \${badge.name}:\`, downloadError);
          errors++;
          continue;
        }
        
        // 3. Préparer le buffer
        const buffer = Buffer.from(await fileData.arrayBuffer());
        totalSize += buffer.length;
        
        // 4. Upload vers AWS S3
        const uploadResult = await s3.upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: \`badges/\${badge.name}\`,
          Body: buffer,
          ContentType: 'application/pdf',
          StorageClass: 'STANDARD' // Classe gratuite
        }).promise();
        
        // 5. Vérifier l'upload
        await s3.headObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: \`badges/\${badge.name}\`
        }).promise();
        
        migrated++;
        console.log(\`✅ Migré: \${badge.name} (\${(buffer.length / 1024).toFixed(2)} KB)\`);
        
        // 6. Pause pour éviter surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(\`❌ Erreur migration \${badge.name}:\`, error.message);
        errors++;
      }
    }
    
    const totalSizeMB = totalSize / (1024 * 1024);
    const totalSizeGB = totalSizeMB / 1024;
    
    console.log(\`\\n🏁 MIGRATION TERMINÉE\`);
    console.log(\`====================\`);
    console.log(\`✅ Migrés: \${migrated}\`);
    console.log(\`❌ Erreurs: \${errors}\`);
    console.log(\`📊 Taille totale: \${totalSizeMB.toFixed(2)} MB (\${totalSizeGB.toFixed(3)} GB)\`);
    console.log(\`🎁 Usage AWS gratuit: \${totalSizeGB.toFixed(3)} / 5 GB (\${(totalSizeGB/5*100).toFixed(1)}%)\`);
    console.log(\`💰 Économie mensuelle: 21.92$\`);
    console.log(\`🏆 Économie 1ère année: 263$\`);
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
  }
}

migrateBadgesToAWS();
`;

  return migrationCode;
}

/**
 * Génération des fichiers
 */
function generateFiles() {
  const fs = require('fs');
  
  try {
    // Script de test
    fs.writeFileSync('scripts/test-aws-s3-connection.js', generateTestScript());
    console.log('✅ Généré: scripts/test-aws-s3-connection.js');
    
    // Script de migration
    fs.writeFileSync('scripts/migrate-to-aws-s3.js', generateMigrationScript());
    console.log('✅ Généré: scripts/migrate-to-aws-s3.js');
    
    // Fichier env exemple
    const envExample = `# Configuration AWS S3 (GRATUIT 12 mois)
AWS_ACCESS_KEY_ID=votre_access_key_id_ici
AWS_SECRET_ACCESS_KEY=votre_secret_access_key_ici
AWS_BUCKET_NAME=cnol-badges-storage-votre-nom
AWS_REGION=eu-west-3`;
    
    fs.writeFileSync('.env.local.example', envExample);
    console.log('✅ Généré: .env.local.example');
    
    console.log('\n📁 Fichiers générés avec succès !');
    console.log('📋 Prochaines étapes:');
    console.log('1. Créer votre compte AWS');
    console.log('2. Configurer S3 et obtenir les clés');
    console.log('3. Copier .env.local.example vers .env.local');
    console.log('4. Remplir vos vraies clés AWS');
    console.log('5. npm install aws-sdk');
    console.log('6. node scripts/test-aws-s3-connection.js');
    console.log('7. node scripts/migrate-to-aws-s3.js');
    
  } catch (error) {
    console.error('❌ Erreur génération fichiers:', error);
  }
}

/**
 * Calcul des économies sur plusieurs années
 */
function showSavingsCalculation() {
  console.log('💰 CALCUL DES ÉCONOMIES SUR 3 ANS');
  console.log('=================================\n');
  
  const supabaseCostPerMonth = 21.92;
  const awsFreeMonths = 12;
  const awsCostAfterFree = 0.01; // Très peu après la période gratuite
  
  let totalSupabaseCost = 0;
  let totalAWSCost = 0;
  
  console.log('| Période | Supabase | AWS S3 | Économie |');
  console.log('|---------|----------|--------|----------|');
  
  for (let year = 1; year <= 3; year++) {
    let yearSupabaseCost = supabaseCostPerMonth * 12;
    let yearAWSCost = 0;
    
    if (year === 1) {
      // 1ère année : 12 mois gratuits
      yearAWSCost = 0;
    } else {
      // Années suivantes : coût minimal
      yearAWSCost = awsCostAfterFree * 12;
    }
    
    totalSupabaseCost += yearSupabaseCost;
    totalAWSCost += yearAWSCost;
    
    const yearSavings = yearSupabaseCost - yearAWSCost;
    
    console.log(`| An ${year}    | ${yearSupabaseCost.toFixed(2)}$   | ${yearAWSCost.toFixed(2)}$  | ${yearSavings.toFixed(2)}$ |`);
  }
  
  const totalSavings = totalSupabaseCost - totalAWSCost;
  
  console.log('|---------|----------|--------|----------|');
  console.log(`| TOTAL   | ${totalSupabaseCost.toFixed(2)}$  | ${totalAWSCost.toFixed(2)}$  | ${totalSavings.toFixed(2)}$ |`);
  console.log('\n🎊 ÉCONOMIE TOTALE SUR 3 ANS: ' + totalSavings.toFixed(2) + '$');
  console.log(`📊 Taux d'économie: ${((totalSavings/totalSupabaseCost)*100).toFixed(1)}%`);
}

/**
 * Fonction principale
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'guide';
  
  switch (command) {
    case 'guide':
      showSetupSteps();
      break;
      
    case 'generate':
      generateFiles();
      break;
      
    case 'savings':
      showSavingsCalculation();
      break;
      
    case 'all':
      showSetupSteps();
      console.log('\n' + '='.repeat(60) + '\n');
      showSavingsCalculation();
      console.log('\n' + '='.repeat(60) + '\n');
      generateFiles();
      break;
      
    default:
      console.log('🎁 AWS S3 Configuration GRATUITE');
      console.log('Usage:');
      console.log('  node scripts/aws-s3-gratuit-setup.js guide     (guide étape par étape)');
      console.log('  node scripts/aws-s3-gratuit-setup.js generate  (générer les scripts)');
      console.log('  node scripts/aws-s3-gratuit-setup.js savings   (calcul économies)');
      console.log('  node scripts/aws-s3-gratuit-setup.js all       (tout)');
      break;
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = {
  showSetupSteps,
  generateFiles,
  showSavingsCalculation
};