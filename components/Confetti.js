import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function Confetti({ 
  active = false, 
  duration = 3000,
  particleCount = 50,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'],
  ...props 
}) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Créer les particules
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    }));

    setParticles(newParticles);

    // Animation des particules
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // Gravité
          rotation: particle.rotation + particle.rotationSpeed
        })).filter(particle => particle.y < 110) // Supprimer les particules hors écran
      );
    }, 50);

    // Arrêter l'animation après la durée spécifiée
    const timeout = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active, duration, particleCount, colors]);

  if (!active && particles.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
      {...props}
    >
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'none',
            animation: 'fall 3s linear forwards',
            '@keyframes fall': {
              '0%': {
                transform: `rotate(${particle.rotation}deg) translateY(0)`,
                opacity: 1
              },
              '100%': {
                transform: `rotate(${particle.rotation + 360}deg) translateY(100vh)`,
                opacity: 0
              }
            }
          }}
        />
      ))}
    </Box>
  );
}

// Composant pour les effets de célébration
export function Celebration({ 
  type = 'confetti',
  active = false,
  onComplete,
  ...props 
}) {
  const [showEffect, setShowEffect] = useState(false);

  useEffect(() => {
    if (active) {
      setShowEffect(true);
      const timer = setTimeout(() => {
        setShowEffect(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  switch (type) {
    case 'confetti':
      return <Confetti active={showEffect} {...props} />;
    case 'fireworks':
      return <Fireworks active={showEffect} {...props} />;
    case 'sparkles':
      return <Sparkles active={showEffect} {...props} />;
    default:
      return <Confetti active={showEffect} {...props} />;
  }
}

// Composant pour les feux d'artifice
function Fireworks({ active = false, count = 3, ...props }) {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    if (!active) {
      setFireworks([]);
      return;
    }

    const createFirework = (id) => {
      const x = Math.random() * 100;
      const y = Math.random() * 50 + 25;
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
      
      return {
        id,
        x,
        y,
        particles: Array.from({ length: 20 }, (_, i) => ({
          id: i,
          angle: (i / 20) * 360,
          distance: Math.random() * 50 + 30,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2
        }))
      };
    };

    const newFireworks = Array.from({ length: count }, (_, i) => 
      createFirework(i)
    );

    setFireworks(newFireworks);

    const interval = setInterval(() => {
      setFireworks(prev => prev.filter(fw => fw.particles.length > 0));
    }, 100);

    const timeout = setTimeout(() => {
      setFireworks([]);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active, count]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}
      {...props}
    >
      {fireworks.map(firework => (
        <Box key={firework.id}>
          {firework.particles.map(particle => (
            <Box
              key={particle.id}
              sx={{
                position: 'absolute',
                left: `${firework.x}%`,
                top: `${firework.y}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: '50%',
                transform: `translate(${Math.cos(particle.angle * Math.PI / 180) * particle.distance}px, ${Math.sin(particle.angle * Math.PI / 180) * particle.distance}px)`,
                animation: 'explode 1s ease-out forwards',
                '@keyframes explode': {
                  '0%': {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                  },
                  '100%': {
                    transform: `translate(${Math.cos(particle.angle * Math.PI / 180) * particle.distance}px, ${Math.sin(particle.angle * Math.PI / 180) * particle.distance}px) scale(0)`,
                    opacity: 0
                  }
                }
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// Composant pour les paillettes
function Sparkles({ active = false, count = 30, ...props }) {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 6 + 3
    }));

    setSparkles(newSparkles);

    const timeout = setTimeout(() => {
      setSparkles([]);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [active, count]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}
      {...props}
    >
      {sparkles.map(sparkle => (
        <Box
          key={sparkle.id}
          sx={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: '#ffd700',
            borderRadius: '50%',
            animation: `sparkle 2s ease-in-out ${sparkle.delay}s infinite`,
            '@keyframes sparkle': {
              '0%, 100%': {
                transform: 'scale(0) rotate(0deg)',
                opacity: 0
              },
              '50%': {
                transform: 'scale(1) rotate(180deg)',
                opacity: 1
              }
            }
          }}
        />
      ))}
    </Box>
  );
} 