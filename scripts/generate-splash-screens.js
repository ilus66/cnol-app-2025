#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration des tailles de splash screens
const splashScreens = [
  // iPhone
  { width: 320, height: 568, name: 'splash-320x568.png' },
  { width: 375, height: 667, name: 'splash-375x667.png' },
  { width: 414, height: 736, name: 'splash-414x736.png' },
  { width: 375, height: 812, name: 'splash-375x812.png' },
  { width: 414, height: 896, name: 'splash-414x896.png' },
  { width: 390, height: 844, name: 'splash-390x844.png' },
  { width: 428, height: 926, name: 'splash-428x926.png' },
  
  // iPad
  { width: 768, height: 1024, name: 'splash-768x1024.png' },
  { width: 834, height: 1112, name: 'splash-834x1112.png' },
  { width: 834, height: 1194, name: 'splash-834x1194.png' },
  { width: 1024, height: 1366, name: 'splash-1024x1366.png' },
  
  // Android
  { width: 360, height: 640, name: 'splash-360x640.png' },
  { width: 412, height: 732, name: 'splash-412x732.png' },
  { width: 412, height: 915, name: 'splash-412x915.png' },
  { width: 360, height: 800, name: 'splash-360x800.png' },
  { width: 384, height: 854, name: 'splash-384x854.png' },
  { width: 412, height: 892, name: 'splash-412x892.png' },
  
  // Desktop
  { width: 1280, height: 720, name: 'splash-1280x720.png' },
  { width: 1920, height: 1080, name: 'splash-1920x1080.png' },
];

// Configuration du manifest avec les splash screens
const manifestWithSplashScreens = {
  name: "CNOL 2025",
  short_name: "CNOL",
  description: "Congrès National d'Optique Lunetterie 2025",
  start_url: "/",
  display: "standalone",
  background_color: "#0d47a1",
  theme_color: "#1976d2",
  orientation: "portrait-primary",
  icons: [
    {
      src: "/logo-cnol.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/logo-cnol.png",
      sizes: "512x512",
      type: "image/png"
    }
  ],
  screenshots: splashScreens.map(screen => ({
    src: `/splash/${screen.name}`,
    sizes: `${screen.width}x${screen.height}`,
    type: "image/png",
    form_factor: screen.width < 768 ? "narrow" : "wide"
  }))
};

// Générer le HTML pour les splash screens
function generateSplashScreenHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CNOL 2025 - Chargement...</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
        }
        
        .splash-container {
            text-align: center;
            padding: 2rem;
        }
        
        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease-out;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
            animation: fadeInUp 1s ease-out 0.3s both;
        }
        
        .loading {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            animation: fadeInUp 1s ease-out 0.6s both;
        }
        
        .dot {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite both;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes bounce {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }
        
        @media (max-width: 768px) {
            .title {
                font-size: 1.5rem;
            }
            
            .subtitle {
                font-size: 1rem;
            }
            
            .logo {
                width: 80px;
                height: 80px;
            }
        }
    </style>
</head>
<body>
    <div class="splash-container">
        <img src="/images/cnol-logo-blanc.png" alt="CNOL Logo" class="logo">
        <h1 class="title">CNOL 2025</h1>
        <p class="subtitle">Congrès National d'Optique Lunetterie</p>
        <div class="loading">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </div>
    
    <script>
        // Rediriger vers l'app après un délai
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
        
        // Rediriger immédiatement si l'app est déjà chargée
        if (document.readyState === 'complete') {
            window.location.href = '/';
        }
    </script>
</body>
</html>`;
}

// Générer les fichiers
function generateFiles() {
  const publicDir = path.join(__dirname, '..', 'public');
  const splashDir = path.join(publicDir, 'splash');
  
  // Créer le dossier splash s'il n'existe pas
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }
  
  // Générer le fichier HTML de splash screen
  const splashHTML = generateSplashScreenHTML();
  fs.writeFileSync(path.join(publicDir, 'splash.html'), splashHTML);
  
  // Mettre à jour le manifest
  const manifestPath = path.join(publicDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifestWithSplashScreens, null, 2));
  
  // Créer des fichiers placeholder pour les splash screens
  splashScreens.forEach(screen => {
    const placeholderContent = `# Placeholder pour ${screen.name}
# Taille: ${screen.width}x${screen.height}
# Ce fichier doit être remplacé par une vraie image PNG
# Utilisez un outil comme Figma, Photoshop ou un générateur en ligne
# pour créer une image avec le logo CNOL et le design approprié`;
    
    fs.writeFileSync(path.join(splashDir, screen.name.replace('.png', '.txt')), placeholderContent);
  });
  
  console.log('✅ Splash screens générés avec succès !');
  console.log(`📁 Fichiers créés dans: ${splashDir}`);
  console.log(`🌐 Splash screen HTML: ${path.join(publicDir, 'splash.html')}`);
  console.log(`📋 Manifest mis à jour: ${manifestPath}`);
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Remplacez les fichiers .txt par de vraies images PNG');
  console.log('2. Testez sur différents appareils');
  console.log('3. Ajustez les couleurs et le design si nécessaire');
}

// Exécuter le script
if (require.main === module) {
  generateFiles();
}

module.exports = { generateFiles, splashScreens, manifestWithSplashScreens }; 