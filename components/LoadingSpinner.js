import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

export default function LoadingSpinner({ open = false }) {
  return (
    <Backdrop open={open} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}>
      <CircularProgress color="inherit" size={60} thickness={4} />
    </Backdrop>
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