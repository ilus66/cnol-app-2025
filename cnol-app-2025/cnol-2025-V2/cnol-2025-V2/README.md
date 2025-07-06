# 🎯 CNOL 2025 - Application PWA

**Congrès National d'Optique Lunetterie 2025** - Application Progressive Web App moderne et interactive.

## 🚀 Fonctionnalités Principales

### 📱 PWA (Progressive Web App)
- ✅ **Installation native** sur tous les appareils
- ✅ **Mode hors ligne** avec cache intelligent
- ✅ **Notifications push** en temps réel
- ✅ **Splash screens** personnalisées
- ✅ **Manifest** optimisé pour tous les appareils
- ✅ **Service Worker** pour la performance

### 🎨 Interface Utilisateur Moderne
- ✅ **Design responsive** adapté à tous les écrans
- ✅ **Mode sombre/clair** avec thème automatique
- ✅ **Animations fluides** et micro-interactions
- ✅ **Effets glassmorphism** et parallaxe
- ✅ **Composants animés** avec feedback visuel
- ✅ **Notifications toast** personnalisées

### 🔧 Fonctionnalités Métier
- ✅ **Inscription** avec génération de badges PDF
- ✅ **Espace utilisateur** avec QR codes
- ✅ **Réservations** ateliers et masterclasses
- ✅ **CNOL d'Or** candidatures
- ✅ **Scan QR** pour validation
- ✅ **Administration** complète
- ✅ **Statistiques** et exports

### 🎵 Expérience Utilisateur
- ✅ **Effets sonores** et retours haptiques
- ✅ **Animations de célébration** (confettis, feux d'artifice)
- ✅ **Chargement optimisé** avec spinners
- ✅ **Feedback visuel** pour toutes les actions
- ✅ **Navigation fluide** avec transitions

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Configuration email (SMTP)

### Installation
```bash
# Cloner le projet
git clone [url-du-repo]
cd badge-cnol

# Installer les dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env.local
```

### Variables d'Environnement
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# PWA
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_clé_vapid_publique
NEXT_PUBLIC_VAPID_PRIVATE_KEY=votre_clé_vapid_privée

# Audio (optionnel)
NEXT_PUBLIC_SOUND_ENABLED=true
NEXT_PUBLIC_HAPTIC_ENABLED=true
```

### Démarrage
```bash
# Développement
npm run dev

# Production
npm run build
npm start

# PWA avec splash screens
npm run pwa:build
```

## 📱 Utilisation PWA

### Installation
1. Ouvrir l'application dans Chrome/Safari
2. Cliquer sur "Installer" dans la barre d'adresse
3. L'application s'installe comme une app native

### Fonctionnalités Hors Ligne
- ✅ Navigation entre les pages
- ✅ Consultation des données en cache
- ✅ Interface utilisateur complète
- ✅ Notifications push

### Notifications
- ✅ Notifications de réservation
- ✅ Rappels d'événements
- ✅ Messages d'administration
- ✅ Confirmations d'actions

## 🎨 Composants UI

### Composants Animés
```jsx
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCard from '../components/AnimatedCard';

<AnimatedButton variant="contained" color="primary">
  Mon Bouton Animé
</AnimatedButton>

<AnimatedCard elevation={3}>
  Ma Carte Animée
</AnimatedCard>
```

### Notifications Toast
```jsx
import { useToast } from '../components/Toast';

const { showToast, ToastComponent } = useToast();

showToast('Message de succès !', 'success');
showToast('Attention !', 'warning');
showToast('Erreur !', 'error');
```

### Effets de Célébration
```jsx
import { Celebration } from '../components/Confetti';

<Celebration 
  type="confetti"
  active={showCelebration}
  onComplete={() => setShowCelebration(false)}
/>
```

### Thème Sombre/Clair
```jsx
import { ThemeProvider, useTheme } from '../components/ThemeProvider';

const { isDarkMode, toggleTheme } = useTheme();
```

## 📊 Fonctionnalités Administratives

### Tableau de Bord
- 📈 Statistiques en temps réel
- 👥 Gestion des participants
- 📅 Gestion des événements
- 📧 Envoi d'emails en masse

### Validation
- 🔍 Scan QR pour validation
- ✅ Validation des réservations
- 📋 Gestion des listes d'attente
- 📊 Rapports détaillés

### Exports
- 📄 Export PDF des badges
- 📊 Export CSV des données
- 📈 Graphiques et statistiques
- 📧 Rapports automatisés

## 🔧 Scripts Utiles

```bash
# Générer les splash screens
npm run generate-splash

# Build PWA complet
npm run pwa:build

# Développement PWA
npm run pwa:dev

# Linting
npm run lint
```

## 📁 Structure du Projet

```
badge-cnol/
├── components/          # Composants UI réutilisables
│   ├── AnimatedButton.js
│   ├── AnimatedCard.js
│   ├── Toast.js
│   ├── LoadingSpinner.js
│   ├── ParallaxSection.js
│   ├── GlassCard.js
│   ├── Confetti.js
│   ├── SoundEffects.js
│   ├── ThemeProvider.js
│   └── PWAInstallPrompt.js
├── pages/              # Pages Next.js
│   ├── api/           # API routes
│   ├── admin/         # Interface admin
│   └── ...
├── public/            # Assets statiques
│   ├── splash/        # Splash screens
│   ├── images/        # Images
│   └── manifest.json  # Manifest PWA
├── lib/              # Utilitaires
├── scripts/          # Scripts de génération
└── ...
```

## 🎯 Fonctionnalités Avancées

### Performance
- ⚡ **Lazy loading** des composants
- 🗄️ **Cache intelligent** avec Service Worker
- 📦 **Code splitting** automatique
- 🖼️ **Optimisation des images**

### Accessibilité
- ♿ **Support lecteur d'écran**
- ⌨️ **Navigation clavier**
- 🎨 **Contrastes appropriés**
- 📱 **Responsive design**

### Sécurité
- 🔐 **Authentification Supabase**
- 🛡️ **Validation des données**
- 🔒 **HTTPS obligatoire**
- 🚫 **Protection CSRF**

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installation de Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

### Autres Plateformes
- **Netlify**: Compatible avec Next.js
- **Railway**: Déploiement simple
- **Heroku**: Support Node.js
- **AWS**: Scalabilité avancée

## 📈 Monitoring et Analytics

### Métriques de Performance
- ⏱️ **Core Web Vitals**
- 📊 **Lighthouse Score**
- 🔄 **Temps de chargement**
- 📱 **PWA Score**

### Analytics Utilisateur
- 👥 **Nombre d'installations**
- 📱 **Appareils utilisés**
- 🎯 **Pages populaires**
- ⏰ **Temps de session**

## 🤝 Contribution

### Développement
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request

### Standards de Code
- 📝 **ESLint** pour la qualité
- 🎨 **Prettier** pour le formatage
- 🧪 **Tests** pour la fiabilité
- 📚 **Documentation** complète

## 📞 Support

### Documentation
- 📖 [Guide des Composants](COMPONENTS_GUIDE.md)
- 🎨 [Guide de Design](DESIGN_GUIDE.md)
- 🔧 [Guide Technique](TECHNICAL_GUIDE.md)

### Contact
- 📧 Email: support@cnol2025.com
- 💬 Discord: [Serveur CNOL]
- 📱 WhatsApp: [Groupe Support]

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🎉 Remerciements

Un grand merci à toute l'équipe CNOL 2025 pour leur confiance et leur support dans le développement de cette application PWA moderne et innovante !

**🚀 Prêt pour le CNOL 2025 ! 🚀**