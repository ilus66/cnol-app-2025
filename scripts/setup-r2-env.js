#!/usr/bin/env node

// Script de configuration des variables d'environnement R2
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration des variables d\'environnement Cloudflare R2\n');

// Vérifier si .env existe
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('📁 Fichier .env trouvé');
  
  // Lire le contenu actuel
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Vérifier si les variables R2 sont déjà présentes
  if (envContent.includes('CLOUDFLARE_R2_ACCESS_KEY_ID')) {
    console.log('✅ Variables R2 déjà configurées dans .env');
    console.log('   Vous pouvez maintenant tester la connexion :');
    console.log('   node scripts/test-r2-connection.js');
    return;
  }
  
  console.log('📝 Ajout des variables R2 au fichier .env existant...');
  
  // Ajouter les variables R2
  const newEnvContent = envContent + '\n# Configuration Cloudflare R2\nCLOUDFLARE_R2_ACCOUNT_ID=your_account_id\nCLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id\nCLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key\nCLOUDFLARE_R2_BUCKET_NAME=cnol\nCLOUDFLARE_R2_ENDPOINT=https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com';
  
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ Variables R2 ajoutées au fichier .env');
  
} else {
  console.log('📁 Création d\'un nouveau fichier .env...');
  
  const envContent = `# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://otmttpiqeehfquoqycol.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Configuration Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=cnol
CLOUDFLARE_R2_ENDPOINT=https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com

# Configuration WhatsApp
WASENDER_API_KEY=your_wasender_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Nouveau fichier .env créé avec les variables R2');
}

console.log('\n🔑 MAINTENANT, vous devez :');
console.log('   1. Ouvrir le fichier .env');
console.log('   2. Remplacer "your_access_key_id" par votre vraie clé R2');
console.log('   3. Remplacer "your_secret_access_key" par votre vraie clé secrète R2');
console.log('   4. Remplacer "your_account_id" par votre ID de compte Cloudflare');
console.log('\n📋 Exemple :');
console.log('   CLOUDFLARE_R2_ACCESS_KEY_ID=abc123def456');
console.log('   CLOUDFLARE_R2_SECRET_ACCESS_KEY=xyz789uvw012');
console.log('   CLOUDFLARE_R2_ACCOUNT_ID=9876543210abcdef');
console.log('\n💡 Pour obtenir vos clés R2 :');
console.log('   1. Aller sur https://dash.cloudflare.com/');
console.log('   2. R2 Object Storage > Manage R2 API tokens');
console.log('   3. Create API token > Custom token');
console.log('   4. Permissions : Object Read & Write');
console.log('   5. Resources : Include > Specific bucket > cnol');
console.log('\n🚀 Après configuration, testez avec :');
console.log('   node scripts/test-r2-connection.js');
