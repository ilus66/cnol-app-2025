# 🚀 Migration vers Cloudflare R2

## 📋 Vue d'ensemble

Ce projet migre le stockage des badges de **Supabase Storage** vers **Cloudflare R2** pour résoudre les problèmes de quota et améliorer les performances.

## 🎯 Pourquoi Cloudflare R2 ?

- ✅ **Quota illimité** : Plus de problème de stockage
- ✅ **Prix compétitifs** : 0.015$/GB/mois (pas de frais de sortie)
- ✅ **Performance** : Réseau Cloudflare global
- ✅ **Compatibilité** : API 100% S3 compatible
- ✅ **Simplicité** : Interface claire et intuitive

## 🔧 Prérequis

### 1. Compte Cloudflare R2
- Créer un compte sur [Cloudflare R2](https://dash.cloudflare.com/)
- Créer un bucket nommé `cnol`
- Générer des clés d'API (Access Key ID + Secret Access Key)

### 2. Variables d'environnement
```bash
# Ajouter à votre .env
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=cnol
CLOUDFLARE_R2_ENDPOINT=https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com
```

## 📁 Fichiers créés

### Nouveaux fichiers
- `lib/r2Client.js` - Client Cloudflare R2
- `lib/uploadToR2.js` - Fonctions d'upload vers R2
- `scripts/migrate-to-r2.js` - Script de migration principal
- `scripts/test-r2-connection.js` - Test de connexion R2
- `config-r2-example.js` - Configuration d'exemple

### Fichiers modifiés
- Tous les fichiers d'API qui utilisent Supabase Storage

## 🚀 Étapes de migration

### Étape 1 : Test de connexion
```bash
# Définir les variables d'environnement
export CLOUDFLARE_R2_ACCESS_KEY_ID="your_key"
export CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret"

# Tester la connexion R2
node scripts/test-r2-connection.js
```

### Étape 2 : Migration des badges existants
```bash
# Lancer la migration complète
node scripts/migrate-to-r2.js
```

### Étape 3 : Mise à jour du code
- Remplacer `supabase.storage` par `uploadToR2()`
- Mettre à jour les URLs des badges
- Tester les nouveaux uploads

### Étape 4 : Validation
- Vérifier que tous les badges sont accessibles
- Tester l'envoi de nouveaux badges
- Valider les URLs dans WhatsApp et emails

## 🔄 Processus de migration

### 1. **Inventaire** : Liste tous les badges dans Supabase
### 2. **Téléchargement** : Récupère chaque badge
### 3. **Upload** : Transfère vers Cloudflare R2
### 4. **Log** : Enregistre chaque opération
### 5. **Nettoyage** : Supprime les fichiers de test

## 📊 Monitoring

### Log de migration
Le script génère un fichier `migration-r2-YYYY-MM-DD.json` avec :
- Nom du fichier
- Ancienne URL (Supabase)
- Nouvelle URL (R2)
- Statut de la migration
- Erreurs éventuelles

### Métriques
- Total de fichiers traités
- Nombre de migrations réussies
- Nombre d'erreurs
- Temps de traitement

## ⚠️ Points d'attention

### Avant la migration
- ✅ Sauvegarder la base de données
- ✅ Tester en environnement de développement
- ✅ Vérifier les permissions R2
- ✅ Prévoir un temps d'arrêt

### Pendant la migration
- 🔄 Les anciens liens ne fonctionneront plus
- 🔄 Nouveaux badges utilisent R2
- 🔄 Migration des badges existants

### Après la migration
- ✅ Tous les badges sont sur R2
- ✅ URLs mises à jour
- ✅ Tests de validation complets

## 🆘 Dépannage

### Erreur de connexion R2
```bash
# Vérifier les variables d'environnement
echo $CLOUDFLARE_R2_ACCESS_KEY_ID
echo $CLOUDFLARE_R2_SECRET_ACCESS_KEY

# Tester la connexion
node scripts/test-r2-connection.js
```

### Erreur de migration
- Vérifier le log de migration
- Contrôler les permissions du bucket
- Vérifier l'espace disponible

### Rollback
- Conserver les anciens badges Supabase
- Script de restauration disponible
- Base de données avec anciennes URLs

## 📞 Support

En cas de problème :
1. Vérifier les logs de migration
2. Tester la connexion R2
3. Contrôler les permissions
4. Consulter la documentation Cloudflare

## 🎉 Avantages post-migration

- **Stockage illimité** : Plus de quota
- **Meilleures performances** : Réseau Cloudflare
- **Coûts réduits** : Pas de frais de sortie
- **Scalabilité** : Gestion automatique de la charge
- **Fiabilité** : Infrastructure Cloudflare robuste

---

**Migration prévue :** Dans les 2 prochains jours  
**Responsable :** Équipe technique CNOL  
**Statut :** Prêt pour la migration 🚀
