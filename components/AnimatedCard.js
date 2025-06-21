import { Paper, Box } from '@mui/material';
import { useState } from 'react';

export default function AnimatedCard({ 
  children, 
  elevation = 2, 
  sx = {}, 
  onClick,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const animatedSx = {
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: isHovered 
      ? '0 12px 40px rgba(0,0,0,0.15)' 
      : `${elevation * 2}px ${elevation * 4}px ${elevation * 6}px rgba(0,0,0,0.1)`,
    cursor: onClick ? 'pointer' : 'default',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
      transition: 'transform 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    },
    ...sx
  };

  return (
    <Paper
      elevation={elevation}
      sx={animatedSx}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Paper>
  );
} 