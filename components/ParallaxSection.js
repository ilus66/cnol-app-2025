import { Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

export default function ParallaxSection({ 
  children, 
  speed = 0.5, 
  backgroundImage,
  backgroundPosition = 'center',
  minHeight = '60vh',
  sx = {},
  animateOnScroll = true,
  ...props 
}) {
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffset(rate);

        // Vérifier si l'élément est visible pour les animations
        if (animateOnScroll) {
          const elementTop = rect.top;
          const elementBottom = rect.bottom;
          const isVisible = elementTop < window.innerHeight && elementBottom > 0;
          setIsVisible(isVisible);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Appel initial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, animateOnScroll]);

  const parallaxSx = {
    position: 'relative',
    overflow: 'hidden',
    minHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: animateOnScroll && isVisible 
      ? 'translateY(0) opacity(1)' 
      : animateOnScroll 
        ? 'translateY(50px) opacity(0)',
    transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
    ...(backgroundImage && {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        transform: `translateY(${offset}px)`,
        zIndex: -1,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: -1,
      }
    }),
    ...sx
  };

  return (
    <Box
      ref={ref}
      sx={parallaxSx}
      {...props}
    >
      {children}
    </Box>
  );
}

// Composant pour les animations au scroll
export function ScrollAnimated({ 
  children, 
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.8,
  threshold = 0.1,
  sx = {},
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const getAnimationStyle = () => {
    const baseStyle = {
      transition: `all ${duration}s ease-out`,
      transitionDelay: `${delay}s`,
    };

    switch (animation) {
      case 'fadeInUp':
        return {
          ...baseStyle,
          transform: isVisible ? 'translateY(0) opacity(1)' : 'translateY(50px) opacity(0)',
        };
      case 'fadeInDown':
        return {
          ...baseStyle,
          transform: isVisible ? 'translateY(0) opacity(1)' : 'translateY(-50px) opacity(0)',
        };
      case 'fadeInLeft':
        return {
          ...baseStyle,
          transform: isVisible ? 'translateX(0) opacity(1)' : 'translateX(-50px) opacity(0)',
        };
      case 'fadeInRight':
        return {
          ...baseStyle,
          transform: isVisible ? 'translateX(0) opacity(1)' : 'translateX(50px) opacity(0)',
        };
      case 'scaleIn':
        return {
          ...baseStyle,
          transform: isVisible ? 'scale(1) opacity(1)' : 'scale(0.8) opacity(0)',
        };
      case 'rotateIn':
        return {
          ...baseStyle,
          transform: isVisible ? 'rotate(0deg) opacity(1)' : 'rotate(-10deg) opacity(0)',
        };
      default:
        return {
          ...baseStyle,
          opacity: isVisible ? 1 : 0,
        };
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        ...getAnimationStyle(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

// Composant pour les animations en cascade
export function CascadeAnimated({ 
  children, 
  animation = 'fadeInUp',
  staggerDelay = 0.1,
  sx = {},
  ...props 
}) {
  return (
    <Box sx={sx} {...props}>
      {Array.isArray(children) ? children.map((child, index) => (
        <ScrollAnimated
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          sx={{ mb: 2 }}
        >
          {child}
        </ScrollAnimated>
      )) : (
        <ScrollAnimated animation={animation}>
          {children}
        </ScrollAnimated>
      )}
    </Box>
  );
} 