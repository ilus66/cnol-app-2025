const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Analyse l'utilisation actuelle du stockage et calcule les économies 
 * possibles avec un stockage externe SANS changer le design
 */
async function analyzeCurrentUsage() {
  console.log('📊 Analyse du stockage actuel - Solution externe');
  console.log('==============================================\n');

  try {
    // 1. Analyser les badges existants
    const { data: files, error } = await supabase.storage
      .from('logos')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Erreur listing fichiers:', error);
      return;
    }

    const badgeFiles = files.filter(file => 
      file.name.endsWith('.pdf') && 
      file.name.includes('badge-cnol2025')
    );

    console.log(`📁 ${badgeFiles.length} badges trouvés dans Supabase`);

    if (badgeFiles.length === 0) {
      console.log('ℹ️ Aucun badge trouvé pour l\'analyse');
      return;
    }

    // 2. Calculer la taille totale (estimation)
    const sampleSize = Math.min(10, badgeFiles.length);
    let totalSampleSize = 0;
    let samplesAnalyzed = 0;

    console.log(`🔍 Analyse d'un échantillon de ${sampleSize} fichiers...\n`);

    for (let i = 0; i < sampleSize; i++) {
      try {
        const { data, error } = await supabase.storage
          .from('logos')
          .download(badgeFiles[i].name);

        if (!error && data) {
          const buffer = Buffer.from(await data.arrayBuffer());
          const sizeKB = buffer.length / 1024;
          totalSampleSize += sizeKB;
          samplesAnalyzed++;
          console.log(`   📄 ${badgeFiles[i].name}: ${sizeKB.toFixed(2)} KB`);
        }
      } catch (e) {
        console.error(`   ❌ Erreur ${badgeFiles[i].name}:`, e.message);
      }
    }

    if (samplesAnalyzed === 0) {
      console.log('❌ Impossible d\'analyser les fichiers');
      return;
    }

    // 3. Calculer les statistiques
    const averageSizeKB = totalSampleSize / samplesAnalyzed;
    const totalSizeKB = averageSizeKB * badgeFiles.length;
    const totalSizeMB = totalSizeKB / 1024;
    const totalSizeGB = totalSizeMB / 1024;

    console.log('\n📊 ANALYSE ACTUELLE');
    console.log('==================');
    console.log(`🎫 Total badges: ${badgeFiles.length}`);
    console.log(`📏 Taille moyenne: ${averageSizeKB.toFixed(2)} KB`);
    console.log(`💾 Taille totale estimée: ${totalSizeMB.toFixed(2)} MB (${totalSizeGB.toFixed(3)} GB)`);

    // 4. Calcul des coûts actuels (estimation Supabase)
    const supabaseCostPerGB = 20; // USD par GB par mois (estimation)
    const currentMonthlyCost = totalSizeGB * supabaseCostPerGB;

    console.log(`💰 Coût Supabase estimé: ${currentMonthlyCost.toFixed(2)}$ /mois`);

    // 5. Solutions de stockage externe
    console.log('\n🌍 OPTIONS DE STOCKAGE EXTERNE');
    console.log('=============================');

    const externalOptions = [
      {
        name: 'AWS S3 Standard',
        costPerGB: 0.023, // USD par GB par mois
        description: 'Accès fréquent'
      },
      {
        name: 'AWS S3 Standard-IA',
        costPerGB: 0.0125, // USD par GB par mois  
        description: 'Accès peu fréquent (recommandé)'
      },
      {
        name: 'AWS S3 Glacier',
        costPerGB: 0.004, // USD par GB par mois
        description: 'Archivage long terme'
      },
      {
        name: 'Google Cloud Storage',
        costPerGB: 0.020, // USD par GB par mois
        description: 'Alternative AWS'
      },
      {
        name: 'Azure Blob Storage',
        costPerGB: 0.018, // USD par GB par mois
        description: 'Microsoft Azure'
      }
    ];

    externalOptions.forEach((option, index) => {
      const monthlyCost = totalSizeGB * option.costPerGB;
      const savings = currentMonthlyCost - monthlyCost;
      const savingsPercent = (savings / currentMonthlyCost) * 100;

      console.log(`\n${index + 1}. ${option.name}`);
      console.log(`   💰 Coût: ${monthlyCost.toFixed(2)}$ /mois`);
      console.log(`   💸 Économie: ${savings.toFixed(2)}$ /mois (${savingsPercent.toFixed(1)}%)`);
      console.log(`   📝 ${option.description}`);
    });

    // 6. Recommandation
    const recommendedOption = externalOptions[1]; // S3 Standard-IA
    const recommendedCost = totalSizeGB * recommendedOption.costPerGB;
    const totalSavings = currentMonthlyCost - recommendedCost;
    const annualSavings = totalSavings * 12;

    console.log('\n🎯 RECOMMANDATION');
    console.log('================');
    console.log(`✅ Solution recommandée: ${recommendedOption.name}`);
    console.log(`💰 Coût mensuel: ${recommendedCost.toFixed(2)}$ (vs ${currentMonthlyCost.toFixed(2)}$ actuellement)`);
    console.log(`💸 Économie mensuelle: ${totalSavings.toFixed(2)}$`);
    console.log(`🏆 Économie annuelle: ${annualSavings.toFixed(2)}$`);

    // 7. Plan de migration
    console.log('\n📋 PLAN DE MIGRATION');
    console.log('===================');
    console.log('1. 🔧 Configurer le stockage externe (AWS S3)');
    console.log('2. 📦 Script de migration des badges existants');
    console.log('3. 🔄 Redirection automatique des nouveaux badges');
    console.log('4. ✅ Vérification de l\'intégrité des fichiers');
    console.log('5. 🗑️ Nettoyage progressif de Supabase');

    // 8. Impact sur la croissance
    const monthlyGrowthGB = 0.2; // Estimation 200MB par mois
    const currentYearlyGrowthCost = monthlyGrowthGB * 12 * supabaseCostPerGB;
    const externalYearlyGrowthCost = monthlyGrowthGB * 12 * recommendedOption.costPerGB;

    console.log('\n📈 IMPACT SUR LA CROISSANCE');
    console.log('===========================');
    console.log(`📊 Croissance estimée: ${monthlyGrowthGB * 1024} MB/mois`);
    console.log(`💰 Coût croissance Supabase: ${currentYearlyGrowthCost.toFixed(2)}$/an`);
    console.log(`💸 Coût croissance externe: ${externalYearlyGrowthCost.toFixed(2)}$/an`);
    console.log(`🎯 Économie sur croissance: ${(currentYearlyGrowthCost - externalYearlyGrowthCost).toFixed(2)}$/an`);

    // 9. ROI
    const migrationCost = 50; // Estimation coût de migration
    const monthsToROI = migrationCost / totalSavings;

    console.log('\n📊 RETOUR SUR INVESTISSEMENT');
    console.log('============================');
    console.log(`💵 Coût de migration estimé: ${migrationCost}$`);
    console.log(`⏱️ Temps pour ROI: ${monthsToROI.toFixed(1)} mois`);
    console.log(`🚀 Bénéfice après 1 an: ${(annualSavings - migrationCost).toFixed(2)}$`);

    return {
      currentSizeGB: totalSizeGB,
      currentMonthlyCost,
      recommendedMonthlyCost: recommendedCost,
      monthlySavings: totalSavings,
      annualSavings
    };

  } catch (error) {
    console.error('❌ Erreur analyse:', error);
  }
}

/**
 * Simule les coûts pour différents volumes
 */
function simulateCostsForVolumes() {
  console.log('\n🧮 SIMULATION COÛTS PAR VOLUME');
  console.log('==============================');

  const volumes = [1, 5, 10, 20, 50]; // GB
  const supabaseCost = 20; // USD par GB
  const externalCost = 0.0125; // AWS S3 Standard-IA

  console.log('| Volume | Supabase | Externe | Économie |');
  console.log('|--------|----------|---------|----------|');

  volumes.forEach(gb => {
    const supabaseMonthly = gb * supabaseCost;
    const externalMonthly = gb * externalCost;
    const savings = supabaseMonthly - externalMonthly;
    const savingsPercent = (savings / supabaseMonthly) * 100;

    console.log(`| ${gb.toString().padStart(4)} GB | ${supabaseMonthly.toFixed(0).padStart(6)}$  | ${externalMonthly.toFixed(2).padStart(5)}$  | ${savingsPercent.toFixed(1).padStart(6)}% |`);
  });
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';

  switch (command) {
    case 'analyze':
      await analyzeCurrentUsage();
      break;

    case 'simulate':
      simulateCostsForVolumes();
      break;

    case 'full':
      await analyzeCurrentUsage();
      simulateCostsForVolumes();
      break;

    default:
      console.log('📊 Analyseur de stockage externe');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/analyze-external-storage.js analyze   (analyser usage actuel)');
      console.log('  node scripts/analyze-external-storage.js simulate  (simuler différents volumes)');
      console.log('  node scripts/analyze-external-storage.js full      (analyse complète)');
      break;
  }
}

// Exécution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeCurrentUsage,
  simulateCostsForVolumes
};