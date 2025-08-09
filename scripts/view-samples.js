const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script pour visualiser et comparer les échantillons de badges
 */

const sampleDir = path.join(process.cwd(), 'demo-quality-badges');

function openFile(filePath) {
  const platform = process.platform;
  let command;
  
  switch (platform) {
    case 'darwin': // macOS
      command = 'open';
      break;
    case 'win32': // Windows
      command = 'start';
      break;
    default: // Linux
      command = 'xdg-open';
      break;
  }
  
  spawn(command, [filePath], { stdio: 'ignore', detached: true });
}

function listSamples() {
  console.log('📁 Échantillons disponibles dans demo-quality-badges/');
  console.log('=================================================\n');
  
  if (!fs.existsSync(sampleDir)) {
    console.log('❌ Répertoire demo-quality-badges/ non trouvé');
    console.log('💡 Exécutez d\'abord: node scripts/demo-badge-quality.js demo');
    return;
  }
  
  const files = fs.readdirSync(sampleDir)
    .filter(file => file.endsWith('.pdf'))
    .sort();
  
  if (files.length === 0) {
    console.log('⚠️ Aucun échantillon PDF trouvé');
    console.log('💡 Exécutez d\'abord: node scripts/demo-badge-quality.js demo');
    return;
  }
  
  files.forEach((file, index) => {
    const filePath = path.join(sampleDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    const descriptions = {
      '1-original-reference.pdf': '📄 Original (référence) - NON recommandé',
      '2-impression-physique.pdf': '🖨️ Impression physique - Qualité maximale',
      '3-email-professionnel.pdf': '📧 Email professionnel - Bon compromis',
      '4-whatsapp-sms.pdf': '📱 WhatsApp/SMS - Ultra compact',
      '5-affichage-digital.pdf': '💻 Affichage digital - Équilibré',
      '6-stockage-archive.pdf': '💾 Stockage/Archive - Minimal'
    };
    
    const description = descriptions[file] || '📄 Échantillon';
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   ${description}`);
    console.log(`   📊 Taille: ${sizeKB} KB`);
    console.log('');
  });
  
  return files;
}

function compareSizes() {
  console.log('📊 Comparaison des tailles');
  console.log('=========================\n');
  
  const files = fs.readdirSync(sampleDir)
    .filter(file => file.endsWith('.pdf'))
    .sort();
  
  if (files.length === 0) return;
  
  const originalFile = files.find(f => f.includes('original'));
  if (!originalFile) {
    console.log('⚠️ Fichier original non trouvé pour comparaison');
    return;
  }
  
  const originalSize = fs.statSync(path.join(sampleDir, originalFile)).size;
  const originalSizeKB = originalSize / 1024;
  
  console.log('| Fichier | Taille | Économie | Recommandation |');
  console.log('|---------|--------|----------|----------------|');
  
  files.forEach(file => {
    const filePath = path.join(sampleDir, file);
    const size = fs.statSync(filePath).size;
    const sizeKB = size / 1024;
    const savings = ((originalSize - size) / originalSize * 100);
    
    const recommendations = {
      'original': 'Non recommandé',
      'impression': 'Impression physique',
      'email': 'Envoi email',
      'whatsapp': 'WhatsApp/Mobile',
      'digital': 'Affichage écran',
      'stockage': 'Archive/Stockage'
    };
    
    let recommendation = 'Autre';
    Object.keys(recommendations).forEach(key => {
      if (file.toLowerCase().includes(key)) {
        recommendation = recommendations[key];
      }
    });
    
    console.log(`| ${file.substring(0, 25).padEnd(25)} | ${sizeKB.toFixed(2).padStart(6)} KB | ${savings >= 0 ? '-' : '+'}${Math.abs(savings).toFixed(1).padStart(5)}% | ${recommendation.padEnd(14)} |`);
  });
  
  console.log('\n💡 Économie par rapport à l\'original de', originalSizeKB.toFixed(2), 'KB');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';
  
  switch (command) {
    case 'list':
      listSamples();
      break;
      
    case 'compare':
      compareSizes();
      break;
      
    case 'open':
      const fileNumber = parseInt(args[1]);
      const files = listSamples();
      
      if (fileNumber && fileNumber >= 1 && fileNumber <= files.length) {
        const selectedFile = files[fileNumber - 1];
        const filePath = path.join(sampleDir, selectedFile);
        console.log(`📖 Ouverture de: ${selectedFile}`);
        openFile(filePath);
      } else if (args[1] === 'all') {
        console.log('📖 Ouverture de tous les échantillons...');
        files.forEach(file => {
          const filePath = path.join(sampleDir, file);
          openFile(filePath);
          // Petit délai pour éviter d'ouvrir tout en même temps
          setTimeout(() => {}, 500);
        });
      } else {
        console.log('❌ Numéro de fichier invalide');
        console.log('💡 Utilisez: node scripts/view-samples.js open [1-6] ou "all"');
      }
      break;
      
    case 'print-test':
      const printFile = path.join(sampleDir, '2-impression-physique.pdf');
      if (fs.existsSync(printFile)) {
        console.log('🖨️ Ouverture du badge impression pour test...');
        console.log('💡 Testez l\'impression sur papier pour vérifier la qualité');
        openFile(printFile);
      } else {
        console.log('❌ Fichier d\'impression non trouvé');
      }
      break;
      
    case 'whatsapp-test':
      const whatsappFile = path.join(sampleDir, '4-whatsapp-sms.pdf');
      if (fs.existsSync(whatsappFile)) {
        console.log('📱 Ouverture du badge WhatsApp...');
        console.log('💡 Testez l\'envoi sur mobile pour vérifier la rapidité');
        openFile(whatsappFile);
      } else {
        console.log('❌ Fichier WhatsApp non trouvé');
      }
      break;
      
    case 'help':
    default:
      console.log('📁 Script de visualisation des échantillons badges');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/view-samples.js list              (lister les échantillons)');
      console.log('  node scripts/view-samples.js compare           (comparer les tailles)');
      console.log('  node scripts/view-samples.js open [1-6]        (ouvrir un échantillon)');
      console.log('  node scripts/view-samples.js open all          (ouvrir tous les échantillons)');
      console.log('  node scripts/view-samples.js print-test        (test impression)');
      console.log('  node scripts/view-samples.js whatsapp-test     (test WhatsApp)');
      console.log('');
      console.log('Exemples:');
      console.log('  node scripts/view-samples.js open 2            (ouvrir badge impression)');
      console.log('  node scripts/view-samples.js open 4            (ouvrir badge WhatsApp)');
      console.log('  node scripts/view-samples.js compare           (voir tableau comparatif)');
      break;
  }
}

// Exécution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  listSamples,
  compareSizes,
  openFile
};