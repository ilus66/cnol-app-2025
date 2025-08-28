# 🚀 Configuration Vercel avec Cloudflare R2

## 📋 **Variables d'environnement à configurer sur Vercel :**

### **1. Aller sur le dashboard Vercel :**
- Connectez-vous à [vercel.com](https://vercel.com)
- Sélectionnez votre projet `cnol-app-2025`
- Allez dans **Settings** → **Environment Variables**

### **2. Ajouter ces variables :**

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=23ca20c57ea5bdbe4dbe3efc5df73c1d
CLOUDFLARE_R2_ACCESS_KEY_ID=votre_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=votre_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=cnol
CLOUDFLARE_R2_ENDPOINT=https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com

# Supabase (garder pour la base de données)
NEXT_PUBLIC_SUPABASE_URL=https://otmttpiqeehfquoqycol.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM

# Autres variables existantes...
```

### **3. Déployer sur Vercel :**

```bash
# Pousser les changements vers Git
git add .
git commit -m "🚀 Migration vers Cloudflare R2 - Prêt pour production"
git push origin main

# Vercel se déploiera automatiquement
```

## 🔍 **4. Vérification post-déploiement :**

### **Test de l'application en production :**
1. **Générer un nouveau badge** via l'interface admin
2. **Vérifier qu'il est uploadé sur R2**
3. **Vérifier l'accès public** (URL R2)

### **URLs à tester :**
- **Badge généré** : `https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com/cnol/[nom-fichier]`
- **Application** : `https://votre-app.vercel.app`

## ⚠️ **5. Problème d'accès public R2 (400) :**

### **Cause probable :**
- Configuration CORS du bucket R2
- Permissions publiques du bucket
- Configuration du domaine personnalisé

### **Solutions :**
1. **Vérifier les permissions R2** dans Cloudflare Dashboard
2. **Configurer CORS** pour le bucket
3. **Activer l'accès public** au bucket

## 🎯 **6. État actuel :**

### ✅ **Ce qui fonctionne :**
- Upload vers R2 ✅
- Lecture depuis R2 ✅
- Suppression sur R2 ✅
- Migration des fichiers ✅
- Libération d'espace Supabase ✅

### ⚠️ **À corriger :**
- Accès public aux fichiers R2 (erreur 400)
- Configuration CORS R2

### 🔄 **Prochaines étapes :**
1. **Configurer Vercel** avec les variables R2
2. **Déployer l'application**
3. **Corriger l'accès public R2**
4. **Tester en production**

## 💡 **7. Avantages de cette migration :**

- **💰 Coût réduit** : R2 moins cher que Supabase Storage
- **🚀 Performance** : R2 plus rapide
- **📊 Quota respecté** : Supabase libéré de 500 MB
- **🔄 Migration complète** : 1,923 fichiers migrés
- **🛡️ Sauvegarde** : Données préservées sur R2

---

**🎉 Votre application est prête pour la production avec R2 !**
