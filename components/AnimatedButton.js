import { Button } from '@mui/material';
import { useState } from 'react';

export default function AnimatedButton({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  href, 
  onClick, 
  sx = {}, 
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const animatedSx = {
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 8px 25px rgba(0,0,0,0.15)' 
      : '0 4px 12px rgba(0,0,0,0.1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: isHovered ? '0%' : '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.5s ease',
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
    '&:active': {
      transform: 'translateY(0px)',
      transition: 'transform 0.1s',
    },
    ...sx
  };

  return (
    <Button
      variant={variant}
      color={color}
      href={href}
      onClick={onClick}
      sx={animatedSx}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Button>
  );
} 