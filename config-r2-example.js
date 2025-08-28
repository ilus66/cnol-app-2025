// Configuration Cloudflare R2 - Exemple
// Copier ce fichier vers config-r2.js et remplir vos vraies clés

module.exports = {
  // Configuration Cloudflare R2 (remplace Supabase Storage)
  CLOUDFLARE_R2_ACCOUNT_ID: 'your_account_id',
  CLOUDFLARE_R2_ACCESS_KEY_ID: 'your_access_key_id', 
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'your_secret_access_key',
  CLOUDFLARE_R2_BUCKET_NAME: 'cnol',
  CLOUDFLARE_R2_ENDPOINT: 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com',
  
  // Configuration Supabase (garder pour la migration)
  SUPABASE_URL: 'https://otmttpiqeehfquoqycol.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key'
};

/*
INSTRUCTIONS:
1. Copier ce fichier vers config-r2.js
2. Remplir vos vraies clés Cloudflare R2
3. Exécuter le script de migration
4. Mettre à jour le code pour utiliser R2
*/
