import { Box, CircularProgress, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

export default function LoadingSpinner({ 
  message = 'Chargement...', 
  size = 'medium',
  variant = 'circular',
  color = 'primary',
  fullScreen = false,
  sx = {}
}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 40;
      case 'large': return 60;
      default: return 40;
    }
  };

  const spinnerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999,
    }),
    ...sx
  };

  if (variant === 'dots') {
    return (
      <Box sx={spinnerSx}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: `${color}.main`,
                animation: 'bounce 1.4s ease-in-out infinite both',
                animationDelay: `${i * 0.16}s`,
                '@keyframes bounce': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0)',
                  },
                  '40%': {
                    transform: 'scale(1)',
                  },
                },
              }}
            />
          ))}
        </Box>
        {message && (
          <Typography variant="body2" color="text.secondary">
            {message}{dots}
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === 'pulse') {
    return (
      <Box sx={spinnerSx}>
        <Box
          sx={{
            width: getSize(),
            height: getSize(),
            borderRadius: '50%',
            backgroundColor: `${color}.main`,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0.95)',
                opacity: 0.5,
              },
              '50%': {
                transform: 'scale(1.05)',
                opacity: 1,
              },
              '100%': {
                transform: 'scale(0.95)',
                opacity: 0.5,
              },
            },
          }}
        />
        {message && (
          <Typography variant="body2" color="text.secondary">
            {message}{dots}
          </Typography>
        )}
      </Box>
    );
  }

  // Variant circulaire par défaut
  return (
    <Box sx={spinnerSx}>
      <CircularProgress 
        size={getSize()} 
        color={color}
        sx={{
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }}
      />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}{dots}
        </Typography>
      )}
    </Box>
  );
}

// Composant de chargement pour les boutons
export function ButtonSpinner({ size = 20, color = 'inherit' }) {
  return (
    <CircularProgress 
      size={size} 
      color={color}
      sx={{
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        }
      }}
    />
  );
}

// Composant de chargement pour les cartes
export function CardSkeleton({ height = 200, width = '100%' }) {
  return (
    <Box
      sx={{
        height,
        width,
        backgroundColor: 'grey.200',
        borderRadius: 1,
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%': {
            opacity: 0.6,
          },
          '50%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0.6,
          },
        },
      }}
    />
  );
} 