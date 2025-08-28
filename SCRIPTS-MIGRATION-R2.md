# 📋 Scripts de Migration vers Cloudflare R2

## 🚀 Vue d'ensemble

Cette collection de scripts permet de migrer complètement votre stockage de **Supabase Storage** vers **Cloudflare R2**.

## 📁 Scripts disponibles

### 1. **Configuration et Test**
- **`scripts/setup-r2-env.js`** - Configure automatiquement le fichier .env avec les variables R2
- **`scripts/test-r2-connection.js`** - Teste la connexion et les permissions R2

### 2. **Migration par Type**
- **`scripts/migrate-to-r2.js`** - Migration des badges uniquement
- **`scripts/migrate-tickets-to-r2.js`** - Migration des tickets uniquement
- **`scripts/migrate-all-to-r2.js`** - Migration complète de tous les fichiers

### 3. **Utilitaires**
- **`lib/r2Client.js`** - Client Cloudflare R2
- **`lib/uploadToR2.js`** - Fonctions d'upload vers R2

## 🔧 Ordre d'exécution recommandé

### Étape 1 : Configuration
```bash
# 1. Configurer les variables d'environnement
node scripts/setup-r2-env.js

# 2. Éditer le fichier .env avec vos vraies clés R2
nano .env

# 3. Tester la connexion R2
node scripts/test-r2-connection.js
```

### Étape 2 : Migration
```bash
# Option A : Migration complète (recommandée)
node scripts/migrate-all-to-r2.js

# Option B : Migration par type
node scripts/migrate-to-r2.js        # Badges
node scripts/migrate-tickets-to-r2.js # Tickets
```

### Étape 3 : Validation
```bash
# Vérifier les logs de migration
ls -la migration-*-r2-*.json

# Tester l'accès aux fichiers migrés
# Ouvrir quelques URLs R2 dans le navigateur
```

## 📊 Types de fichiers gérés

| Type | Extensions | Description |
|------|------------|-------------|
| **Badges** | `.pdf` | Badges des participants |
| **Tickets** | `.pdf` | Tickets masterclass/ateliers |
| **Logos** | `.jpg`, `.png` | Logos et images |
| **Images** | `.jpg`, `.png`, `.jpeg` | Autres images |
| **Autres** | Tous | Fichiers non catégorisés |

## 🔍 Monitoring et Logs

### Logs générés
- `migration-complete-r2-YYYY-MM-DD.json` - Migration complète
- `migration-r2-YYYY-MM-DD.json` - Badges uniquement
- `migration-tickets-r2-YYYY-MM-DD.json` - Tickets uniquement

### Métriques incluses
- Nombre total de fichiers
- Répartition par type
- Taille des fichiers
- URLs anciennes vs nouvelles
- Statut de chaque migration
- Erreurs détaillées

## ⚠️ Points d'attention

### Avant la migration
- ✅ Sauvegarder la base de données
- ✅ Vérifier les permissions R2
- ✅ Tester en environnement de développement
- ✅ Prévoir un temps d'arrêt

### Pendant la migration
- 🔄 Les anciens liens ne fonctionneront plus
- 🔄 Nouveaux fichiers utilisent R2
- 🔄 Migration des fichiers existants

### Après la migration
- ✅ Tous les fichiers sont sur R2
- ✅ URLs mises à jour
- ✅ Tests de validation complets

## 🆘 Dépannage

### Erreur de connexion R2
```bash
# Vérifier les variables
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
- Conserver les anciens fichiers Supabase
- Scripts de restauration disponibles
- Base de données avec anciennes URLs

## 💰 Estimation des coûts

### Cloudflare R2
- **Stockage** : 0.015$/GB/mois
- **Transfert sortant** : Gratuit
- **Requêtes** : 0.36$/million
- **Quota** : Illimité

### Comparaison avec Supabase
- **Stockage** : Quota limité
- **Transfert** : Frais de sortie
- **Scalabilité** : Limitée

## 🎯 Prochaines étapes

### 1. **Mise à jour du code**
- Remplacer `supabase.storage` par `uploadToR2()`
- Mettre à jour les URLs des fichiers
- Tester les nouveaux uploads

### 2. **Validation**
- Vérifier l'accès aux fichiers migrés
- Tester l'envoi de nouveaux fichiers
- Valider les URLs dans WhatsApp et emails

### 3. **Production**
- Déployer les modifications
- Surveiller les performances
- Optimiser si nécessaire

## 📞 Support

En cas de problème :
1. Vérifier les logs de migration
2. Tester la connexion R2
3. Contrôler les permissions
4. Consulter la documentation Cloudflare

---

**Migration prévue :** Dans les 2 prochains jours  
**Responsable :** Équipe technique CNOL  
**Statut :** Scripts prêts pour la migration 🚀
