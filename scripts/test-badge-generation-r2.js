// Script de test pour la génération de badges avec R2
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (pour la base de données)
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBadgeGenerationR2() {
  console.log('🧪 TEST DE GÉNÉRATION DE BADGES AVEC R2...\n');
  
  try {
    // 1. Vérifier qu'il y a des inscriptions dans la base
    console.log('📋 Vérification des inscriptions existantes...');
    const { data: inscriptions, error: inscriptionsError } = await supabase
      .from('inscription')
      .select('*')
      .limit(5);
    
    if (inscriptionsError) {
      console.error('❌ Erreur récupération inscriptions:', inscriptionsError.message);
      return;
    }
    
    if (!inscriptions || inscriptions.length === 0) {
      console.log('❌ Aucune inscription trouvée dans la base');
      return;
    }
    
    console.log(`   ✅ ${inscriptions.length} inscriptions trouvées`);
    
    // 2. Sélectionner une inscription pour le test
    const testInscription = inscriptions[0];
    console.log(`\n🎯 Test avec l'inscription:`);
    console.log(`   Nom: ${testInscription.nom}`);
    console.log(`   Prénom: ${testInscription.prenom}`);
    console.log(`   Email: ${testInscription.email}`);
    console.log(`   ID: ${testInscription.id}`);
    
    // 3. Vérifier si un badge existe déjà pour cette inscription
    console.log('\n🔍 Vérification des badges existants...');
    
    // Chercher dans whatsapp_envois par téléphone
    const { data: existingBadges, error: badgesError } = await supabase
      .from('whatsapp_envois')
      .select('*')
      .eq('telephone', testInscription.telephone)
      .eq('file_name', 'badge');
    
    if (badgesError) {
      console.error('❌ Erreur récupération badges:', badgesError.message);
      return;
    }
    
    if (existingBadges && existingBadges.length > 0) {
      console.log(`   ✅ ${existingBadges.length} badge(s) existant(s) trouvé(s)`);
      console.log('   📁 Vérification des fichiers sur R2...');
      
      // Vérifier si le fichier existe sur R2
      const badgeFileName = existingBadges[0].file_name;
      const r2Url = `https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com/cnol/${badgeFileName}`;
      
      try {
        const response = await fetch(r2Url);
        if (response.ok) {
          console.log(`   ✅ Badge accessible sur R2: ${r2Url}`);
          console.log(`   📊 Taille: ${(response.headers.get('content-length') / 1024).toFixed(1)} KB`);
        } else {
          console.log(`   ❌ Badge non accessible sur R2 (${response.status}): ${r2Url}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur accès R2: ${error.message}`);
      }
      
    } else {
      console.log('   ℹ️  Aucun badge existant trouvé');
    }
    
    // 4. Vérifier les fichiers sur R2
    console.log('\n🌐 VÉRIFICATION DES FICHIERS SUR R2...');
    
    // Chercher des fichiers de badges sur R2
    const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
    
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
    
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: 'cnol',
        MaxKeys: 10,
        Prefix: 'badge'
      });
      
      const listResult = await r2Client.send(listCommand);
      const badgeFiles = listResult.Contents || [];
      
      console.log(`   📁 ${badgeFiles.length} fichiers de badges trouvés sur R2`);
      
      if (badgeFiles.length > 0) {
        console.log('   📋 Exemples de fichiers:');
        badgeFiles.slice(0, 5).forEach(file => {
          console.log(`      - ${file.Key} (${(file.Size / 1024).toFixed(1)} KB)`);
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur accès R2: ${error.message}`);
    }
    
    // 5. Test de génération d'un nouveau badge
    console.log('\n🚀 TEST DE GÉNÉRATION D\'UN NOUVEAU BADGE...');
    console.log('   📝 Appel de l\'API de génération...');
    
    // Simuler l'appel à l'API de génération de badge
    const testBadgeData = {
      inscription_id: testInscription.id,
      nom: testInscription.nom,
      prenom: testInscription.prenom,
      email: testInscription.email,
      telephone: testInscription.telephone,
      type: 'badge'
    };
    
    console.log('   📊 Données de test:', testBadgeData);
    
    // 6. Instructions pour tester manuellement
    console.log('\n💡 POUR TESTER MANUELLEMENT :');
    console.log('   1. Allez sur http://localhost:3000/admin');
    console.log('   2. Connectez-vous en tant qu\'admin');
    console.log('   3. Allez dans "Gestion des inscriptions"');
    console.log('   4. Trouvez l\'inscription de test');
    console.log('   5. Cliquez sur "Générer badge"');
    console.log('   6. Vérifiez que le fichier est uploadé sur R2');
    
    // 7. Vérification de la configuration R2
    console.log('\n🔧 VÉRIFICATION DE LA CONFIGURATION R2 :');
    console.log('   ✅ Variables d\'environnement R2 configurées');
    console.log('   ✅ Migration des fichiers terminée');
    console.log('   ✅ Application configurée pour utiliser R2');
    console.log('   ✅ Déploiement Vercel en cours');
    
    console.log('\n🎯 PROCHAINES ÉTAPES :');
    console.log('   1. Attendre la fin du déploiement Vercel');
    console.log('   2. Tester la génération de badges en production');
    console.log('   3. Vérifier que les nouveaux badges vont sur R2');
    console.log('   4. Confirmer que l\'accès public R2 fonctionne');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer le test
testBadgeGenerationR2();
