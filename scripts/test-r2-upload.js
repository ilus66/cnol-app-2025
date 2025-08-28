// Script de test pour l'upload R2
const { uploadToR2 } = require('../lib/uploadToR2.js');

async function testR2Upload() {
  console.log('🧪 Test d\'upload vers Cloudflare R2...\n');
  
  try {
    // Créer un fichier de test
    const testContent = 'Test d\'upload R2 - ' + new Date().toISOString();
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    // Nom du fichier de test
    const fileName = `test-upload-r2-${Date.now()}.txt`;
    
    console.log(`📝 Test d'upload du fichier: ${fileName}`);
    
    // Upload vers R2
    const result = await uploadToR2(fileName, testBuffer, 'text/plain');
    
    if (result.success) {
      console.log('✅ Upload R2 réussi !');
      console.log(`   📁 Fichier: ${fileName}`);
      console.log(`   🌐 URL: ${result.publicUrl}`);
      console.log(`   🏷️  ETag: ${result.etag}`);
      
      // Tester l'accès au fichier
      console.log('\n🔍 Test d\'accès au fichier...');
      try {
        const response = await fetch(result.publicUrl);
        if (response.ok) {
          console.log('✅ Fichier accessible via URL publique');
        } else {
          console.log('❌ Fichier non accessible');
        }
      } catch (error) {
        console.log('❌ Erreur accès fichier:', error.message);
      }
      
    } else {
      console.log('❌ Échec de l\'upload R2');
      console.log('   Erreur:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testR2Upload();
