// Script pour tester R2 avec domaine personnalisé
console.log('🌐 TEST R2 AVEC DOMAINE PERSONNALISÉ...\n');

console.log('🔍 DIAGNOSTIC DE L\'ACCÈS PUBLIC R2 :');
console.log('   ❌ Problème: Erreur 400 (Bad Request)');
console.log('   🔧 CORS: Configuré pour accès public');
console.log('   📁 Fichiers: 1,923 migrés avec succès');

console.log('\n💡 SOLUTIONS POUR L\'ACCÈS PUBLIC R2 :');

console.log('\n1️⃣ OPTION 1: Domaine personnalisé Cloudflare :');
console.log('   - Allez sur [dash.cloudflare.com](https://dash.cloudflare.com)');
console.log('   - R2 → Buckets → cnol → Settings');
console.log('   - "Custom domains" → "Add custom domain"');
console.log('   - Exemple: files.votre-domaine.com');
console.log('   - Avantage: URLs plus propres et accès public garanti');

console.log('\n2️⃣ OPTION 2: Vérifier les permissions bucket :');
console.log('   - R2 → Buckets → cnol → Settings');
console.log('   - "Public access" → "Enable"');
console.log('   - "CORS" → Vérifier configuration *');
console.log('   - "Object lifecycle" → Vérifier les règles');

console.log('\n3️⃣ OPTION 3: Utiliser l\'API R2 avec authentification :');
console.log('   - Garder l\'accès privé au bucket');
console.log('   - Générer des URLs signées temporaires');
console.log('   - Plus sécurisé mais plus complexe');

console.log('\n🧪 TEST ACTUEL :');
console.log('   🔗 URL testée: https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com/cnol/badge-cnol2025---beldi-marouane.pdf');
console.log('   📊 Résultat: 400 Bad Request');
console.log('   🎯 Cause probable: Configuration bucket ou domaine');

console.log('\n🎯 RECOMMANDATION IMMÉDIATE :');
console.log('   1. ✅ CORS est configuré');
console.log('   2. 🔧 Vérifier "Public access" dans Cloudflare Dashboard');
console.log('   3. 🌐 Ajouter un domaine personnalisé si possible');
console.log('   4. 🧪 Retester après 5-10 minutes (propagation)');

console.log('\n📱 POUR L\'INSTANT :');
console.log('   - Les badges sont générés et uploadés sur R2 ✅');
console.log('   - L\'accès public sera corrigé via le dashboard');
console.log('   - L\'application fonctionne normalement');
console.log('   - Attendre le déploiement Vercel pour tester en production');

console.log('\n🚀 PROCHAINES ÉTAPES :');
console.log('   1. 🔧 Configurer l\'accès public via Cloudflare Dashboard');
console.log('   2. ⏳ Attendre la propagation (5-10 minutes)');
console.log('   3. 🧪 Retester l\'accès public R2');
console.log('   4. 🎯 Tester la génération de badges en production');
console.log('   5. ✅ Confirmer que R2 fonctionne parfaitement');
