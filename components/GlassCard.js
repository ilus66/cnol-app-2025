import { Paper, Box } from '@mui/material';
import { useState } from 'react';

export default function GlassCard({ 
  children, 
  blur = 10,
  opacity = 0.1,
  borderOpacity = 0.2,
  background = 'rgba(255, 255, 255, 0.1)',
  borderColor = 'rgba(255, 255, 255, 0.2)',
  sx = {},
  hover = true,
  onClick,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const glassSx = {
    position: 'relative',
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: background,
    border: `1px solid ${borderColor}`,
    borderRadius: 3,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,${opacity * 0.5}) 100%)`,
      borderRadius: 'inherit',
      zIndex: -1,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${borderColor} 0%, transparent 50%, ${borderColor} 100%)`,
      opacity: isHovered && hover ? 0.8 : 0,
      transition: 'opacity 0.3s ease',
      borderRadius: 'inherit',
      zIndex: -1,
    },
    ...(hover && {
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        borderColor: `rgba(255, 255, 255, ${borderOpacity * 1.5})`,
        '&::after': {
          opacity: 0.8,
        },
      },
    }),
    ...sx
  };

  return (
    <Paper
      elevation={0}
      sx={glassSx}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Paper>
  );
}

// Variante avec effet de néon
export function NeonGlassCard({ 
  children, 
  neonColor = '#667eea',
  sx = {},
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const neonSx = {
    position: 'relative',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${neonColor}40`,
    borderRadius: 3,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: isHovered 
      ? `0 0 20px ${neonColor}40, 0 0 40px ${neonColor}20, 0 0 60px ${neonColor}10`
      : 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${neonColor}10 0%, transparent 50%, ${neonColor}10 100%)`,
      opacity: isHovered ? 1 : 0,
      transition: 'opacity 0.3s ease',
      borderRadius: 'inherit',
      zIndex: -1,
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: `${neonColor}80`,
    },
    ...sx
  };

  return (
    <GlassCard
      sx={neonSx}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </GlassCard>
  );
}

// Variante avec effet de gradient animé
export function GradientGlassCard({ 
  children, 
  gradientColors = ['#667eea', '#764ba2'],
  sx = {},
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const gradientSx = {
    position: 'relative',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${gradientColors[0]}20 0%, ${gradientColors[1]}20 100%)`,
      opacity: isHovered ? 1 : 0.3,
      transition: 'opacity 0.4s ease',
      borderRadius: 'inherit',
      zIndex: -1,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: `conic-gradient(from ${isHovered ? '360deg' : '0deg'}, ${gradientColors[0]}20, ${gradientColors[1]}20, ${gradientColors[0]}20)`,
      animation: isHovered ? 'rotate 3s linear infinite' : 'none',
      borderRadius: 'inherit',
      zIndex: -2,
      '@keyframes rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    },
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `0 20px 40px rgba(0,0,0,0.15), 0 0 30px ${gradientColors[0]}30`,
    },
    ...sx
  };

  return (
    <GlassCard
      sx={gradientSx}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </GlassCard>
  );
} 