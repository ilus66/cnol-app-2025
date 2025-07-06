# 🎨 Guide des Composants UI - CNOL 2025

## 📋 Table des Matières

1. [Composants d'Installation PWA](#pwa-installation)
2. [Composants Animés](#animated-components)
3. [Composants de Notification](#notification-components)
4. [Composants de Chargement](#loading-components)
5. [Composants de Parallaxe](#parallax-components)
6. [Composants Glassmorphism](#glassmorphism-components)
7. [Composants de Célébration](#celebration-components)
8. [Composants Audio](#audio-components)
9. [Composants de Thème](#theme-components)
10. [Utilisation et Exemples](#usage-examples)

---

## 🚀 PWA Installation

### PWAInstallPrompt
Composant pour gérer l'installation de l'application PWA.

```jsx
import PWAInstallPrompt from '../components/PWAInstallPrompt';

// Utilisation automatique dans les pages
<PWAInstallPrompt />
```

**Fonctionnalités :**
- ✅ Prompt d'installation automatique
- ✅ Gestion des mises à jour
- ✅ Détection si déjà installée
- ✅ Design moderne avec animations

---

## 🎭 Composants Animés

### AnimatedButton
Bouton avec effets de survol et micro-interactions.

```jsx
import AnimatedButton from '../components/AnimatedButton';

<AnimatedButton 
  variant="contained" 
  color="primary"
  href="/mon-espace"
>
  Mon Espace
</AnimatedButton>
```

**Props :**
- `variant`: "contained", "outlined", "text"
- `color`: "primary", "secondary", "error", etc.
- `href`: Lien de navigation
- `onClick`: Fonction de clic

### AnimatedCard
Carte avec effets de survol et animations.

```jsx
import AnimatedCard from '../components/AnimatedCard';

<AnimatedCard elevation={3} onClick={handleClick}>
  <Typography variant="h6">Titre de la carte</Typography>
  <Typography>Contenu de la carte</Typography>
</AnimatedCard>
```

**Props :**
- `elevation`: Niveau d'élévation (1-24)
- `onClick`: Fonction de clic
- `sx`: Styles personnalisés

---

## 🔔 Composants de Notification

### Toast & useToast
Système de notifications toast personnalisées.

```jsx
import { useToast } from '../components/Toast';

function MyComponent() {
  const { showToast, ToastComponent } = useToast();

  const handleSuccess = () => {
    showToast('Opération réussie !', 'success');
  };

  const handleError = () => {
    showToast('Une erreur est survenue', 'error');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Succès</button>
      <button onClick={handleError}>Erreur</button>
      <ToastComponent />
    </div>
  );
}
```

**Types de toast :**
- `success`: Succès (vert)
- `error`: Erreur (rouge)
- `warning`: Avertissement (orange)
- `info`: Information (bleu)

**Positions :**
- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

---

## ⏳ Composants de Chargement

### LoadingSpinner
Spinner de chargement avec différentes variantes.

```jsx
import LoadingSpinner from '../components/LoadingSpinner';

// Spinner simple
<LoadingSpinner message="Chargement..." />

// Spinner plein écran
<LoadingSpinner fullScreen message="Chargement des données..." />

// Spinner avec points
<LoadingSpinner variant="dots" message="Traitement..." />

// Spinner avec pulse
<LoadingSpinner variant="pulse" size="large" />
```

**Props :**
- `message`: Message de chargement
- `size`: "small", "medium", "large"
- `variant`: "circular", "dots", "pulse"
- `color`: Couleur du spinner
- `fullScreen`: Plein écran

### ButtonSpinner
Spinner pour les boutons en cours de chargement.

```jsx
import { ButtonSpinner } from '../components/LoadingSpinner';

<Button disabled={loading}>
  {loading ? <ButtonSpinner /> : 'Envoyer'}
</Button>
```

### CardSkeleton
Squelette de chargement pour les cartes.

```jsx
import { CardSkeleton } from '../components/LoadingSpinner';

<CardSkeleton height={200} width="100%" />
```

---

## 🌊 Composants de Parallaxe

### ParallaxSection
Section avec effet de parallaxe.

```jsx
import ParallaxSection from '../components/ParallaxSection';

<ParallaxSection 
  backgroundImage="/images/background.jpg"
  speed={0.5}
  minHeight="80vh"
>
  <Typography variant="h2" color="white">
    Titre avec Parallaxe
  </Typography>
</ParallaxSection>
```

### ScrollAnimated
Éléments animés au scroll.

```jsx
import { ScrollAnimated } from '../components/ParallaxSection';

<ScrollAnimated animation="fadeInUp" delay={0.2}>
  <Typography variant="h4">Titre animé</Typography>
</ScrollAnimated>

<ScrollAnimated animation="fadeInLeft" delay={0.4}>
  <Typography>Contenu animé</Typography>
</ScrollAnimated>
```

**Animations disponibles :**
- `fadeInUp`: Apparition vers le haut
- `fadeInDown`: Apparition vers le bas
- `fadeInLeft`: Apparition depuis la gauche
- `fadeInRight`: Apparition depuis la droite
- `scaleIn`: Apparition avec zoom
- `rotateIn`: Apparition avec rotation

### CascadeAnimated
Animation en cascade pour plusieurs éléments.

```jsx
import { CascadeAnimated } from '../components/ParallaxSection';

<CascadeAnimated animation="fadeInUp" staggerDelay={0.1}>
  {items.map(item => (
    <Card key={item.id}>
      <Typography>{item.title}</Typography>
    </Card>
  ))}
</CascadeAnimated>
```

---

## 🪟 Composants Glassmorphism

### GlassCard
Carte avec effet de verre.

```jsx
import GlassCard from '../components/GlassCard';

<GlassCard blur={15} opacity={0.1}>
  <Typography variant="h6">Carte en verre</Typography>
  <Typography>Contenu avec effet de flou</Typography>
</GlassCard>
```

### NeonGlassCard
Carte avec effet néon.

```jsx
import { NeonGlassCard } from '../components/GlassCard';

<NeonGlassCard neonColor="#667eea">
  <Typography variant="h6">Carte néon</Typography>
</NeonGlassCard>
```

### GradientGlassCard
Carte avec gradient animé.

```jsx
import { GradientGlassCard } from '../components/GlassCard';

<GradientGlassCard gradientColors={['#667eea', '#764ba2']}>
  <Typography variant="h6">Carte gradient</Typography>
</GradientGlassCard>
```

---

## 🎉 Composants de Célébration

### Confetti
Effet de confetti pour les célébrations.

```jsx
import Confetti from '../components/Confetti';

<Confetti 
  active={showConfetti}
  particleCount={100}
  duration={4000}
/>
```

### Celebration
Système de célébrations avec différents types.

```jsx
import { Celebration } from '../components/Confetti';

<Celebration 
  type="confetti"
  active={showCelebration}
  onComplete={() => setShowCelebration(false)}
/>

<Celebration 
  type="fireworks"
  active={showFireworks}
/>

<Celebration 
  type="sparkles"
  active={showSparkles}
/>
```

**Types disponibles :**
- `confetti`: Confettis colorés
- `fireworks`: Feux d'artifice
- `sparkles`: Paillettes

---

## 🔊 Composants Audio

### useSoundEffects
Hook pour les effets sonores.

```jsx
import { useSoundEffects } from '../components/SoundEffects';

function MyComponent() {
  const { playSuccess, playError, playClick, playScan } = useSoundEffects();

  const handleSuccess = () => {
    playSuccess();
    // Logique métier
  };

  const handleScan = () => {
    playScan();
    // Logique de scan
  };

  return (
    <div>
      <button onClick={handleSuccess}>Succès</button>
      <button onClick={handleScan}>Scanner</button>
    </div>
  );
}
```

**Sons disponibles :**
- `playSuccess`: Son de succès
- `playError`: Son d'erreur
- `playClick`: Son de clic
- `playNotification`: Son de notification
- `playScan`: Son de scan QR

### SoundButton
Bouton avec effets sonores intégrés.

```jsx
import { SoundButton } from '../components/SoundEffects';

<SoundButton 
  soundType="success"
  onClick={handleSuccess}
  soundEnabled={true}
>
  Valider
</SoundButton>
```

### useHapticFeedback
Hook pour les retours haptiques.

```jsx
import { useHapticFeedback } from '../components/SoundEffects';

function MyComponent() {
  const { 
    lightVibration, 
    successVibration, 
    errorVibration 
  } = useHapticFeedback();

  const handleSuccess = () => {
    successVibration();
    // Logique métier
  };

  return <button onClick={handleSuccess}>Succès</button>;
}
```

---

## 🌙 Composants de Thème

### ThemeProvider
Provider pour la gestion des thèmes.

```jsx
import { ThemeProvider } from '../components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <MyApp />
    </ThemeProvider>
  );
}
```

### useTheme
Hook pour accéder au thème.

```jsx
import { useTheme } from '../components/ThemeProvider';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div>
      <p>Mode actuel: {isDarkMode ? 'Sombre' : 'Clair'}</p>
      <button onClick={toggleTheme}>
        Basculer le thème
      </button>
    </div>
  );
}
```

### ThemeToggle
Bouton de basculement de thème.

```jsx
import { ThemeToggle } from '../components/ThemeProvider';

<ThemeToggle sx={{ position: 'fixed', top: 16, right: 16 }} />
```

---

## 📝 Utilisation et Exemples

### Exemple Complet d'une Page

```jsx
import { useState } from 'react';
import { ThemeProvider, useTheme } from '../components/ThemeProvider';
import { useToast } from '../components/Toast';
import { useSoundEffects } from '../components/SoundEffects';
import { Celebration } from '../components/Confetti';
import AnimatedButton from '../components/AnimatedButton';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ScrollAnimated } from '../components/ParallaxSection';

function HomePage() {
  const { showToast, ToastComponent } = useToast();
  const { playSuccess, playError } = useSoundEffects();
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleSuccess = async () => {
    setLoading(true);
    try {
      // Logique métier
      await someAsyncOperation();
      playSuccess();
      showToast('Opération réussie !', 'success');
      setShowCelebration(true);
    } catch (error) {
      playError();
      showToast('Erreur !', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div>
        <ScrollAnimated animation="fadeInUp">
          <GlassCard>
            <h1>Bienvenue au CNOL 2025</h1>
            <p>Le congrès de l'optique lunetterie</p>
          </GlassCard>
        </ScrollAnimated>

        <ScrollAnimated animation="fadeInUp" delay={0.2}>
          <AnimatedButton 
            onClick={handleSuccess}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Commencer'}
          </AnimatedButton>
        </ScrollAnimated>

        <Celebration 
          type="confetti"
          active={showCelebration}
          onComplete={() => setShowCelebration(false)}
        />

        <ToastComponent />
      </div>
    </ThemeProvider>
  );
}
```

### Intégration dans _app.js

```jsx
import { ThemeProvider } from '../components/ThemeProvider';
import { globalStyles } from '../components/ThemeProvider';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <style jsx global>{globalStyles}</style>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
```

---

## 🎯 Bonnes Pratiques

### Performance
- ✅ Utiliser les composants de manière conditionnelle
- ✅ Éviter les re-renders inutiles avec `useMemo` et `useCallback`
- ✅ Lazy loading pour les composants lourds

### Accessibilité
- ✅ Ajouter des `aria-label` pour les icônes
- ✅ Utiliser des contrastes appropriés
- ✅ Support du clavier pour la navigation

### Responsive Design
- ✅ Tester sur différentes tailles d'écran
- ✅ Utiliser les breakpoints Material-UI
- ✅ Adapter les animations pour mobile

### Thème
- ✅ Respecter les couleurs du thème
- ✅ Utiliser les variables CSS personnalisées
- ✅ Tester en mode clair et sombre

---

## 🔧 Configuration

### Variables d'Environnement

```env
# PWA
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_clé_vapid_publique
NEXT_PUBLIC_VAPID_PRIVATE_KEY=votre_clé_vapid_privée

# Audio (optionnel)
NEXT_PUBLIC_SOUND_ENABLED=true
NEXT_PUBLIC_HAPTIC_ENABLED=true
```

### Styles Globaux

Ajouter dans `_app.js` ou `_document.js` :

```jsx
import { globalStyles } from '../components/ThemeProvider';

<style jsx global>{globalStyles}</style>
```

---

## 🚀 Prochaines Étapes

1. **Splash Screens** : Créer des écrans de démarrage pour tous les appareils
2. **Animations Avancées** : Ajouter des animations de page transition
3. **Gamification** : Système de badges et récompenses
4. **Analytics** : Suivi des interactions utilisateur
5. **Tests** : Tests unitaires et d'intégration
6. **Documentation** : Guide utilisateur et API reference

---

## 📞 Support

Pour toute question ou problème avec les composants :

1. Vérifier la documentation
2. Consulter les exemples d'utilisation
3. Tester dans un environnement isolé
4. Contacter l'équipe de développement

---

*Dernière mise à jour : Janvier 2025* 