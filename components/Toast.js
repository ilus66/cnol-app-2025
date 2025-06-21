import { Snackbar, Alert, Box, Typography } from '@mui/material';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import { useState, useEffect } from 'react';

const toastTypes = {
  success: {
    icon: CheckCircle,
    color: '#4caf50',
    bgColor: '#e8f5e8'
  },
  error: {
    icon: Error,
    color: '#f44336',
    bgColor: '#ffebee'
  },
  warning: {
    icon: Warning,
    color: '#ff9800',
    bgColor: '#fff3e0'
  },
  info: {
    icon: Info,
    color: '#2196f3',
    bgColor: '#e3f2fd'
  }
};

export default function Toast({ 
  open, 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  position = 'bottom-right'
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [open]);

  const toastConfig = toastTypes[type] || toastTypes.info;
  const IconComponent = toastConfig.icon;

  const getPosition = () => {
    switch (position) {
      case 'top-left': return { vertical: 'top', horizontal: 'left' };
      case 'top-center': return { vertical: 'top', horizontal: 'center' };
      case 'top-right': return { vertical: 'top', horizontal: 'right' };
      case 'bottom-left': return { vertical: 'bottom', horizontal: 'left' };
      case 'bottom-center': return { vertical: 'bottom', horizontal: 'center' };
      case 'bottom-right': return { vertical: 'bottom', horizontal: 'right' };
      default: return { vertical: 'bottom', horizontal: 'right' };
    }
  };

  return (
    <Snackbar
      open={isVisible}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={getPosition()}
      sx={{
        '& .MuiSnackbar-root': {
          transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
          transition: 'transform 0.3s ease-in-out'
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        sx={{
          minWidth: 300,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: `1px solid ${toastConfig.color}20`,
          background: `linear-gradient(135deg, ${toastConfig.bgColor}, ${toastConfig.bgColor}dd)`,
          '& .MuiAlert-icon': {
            color: toastConfig.color
          },
          '& .MuiAlert-message': {
            color: '#333',
            fontWeight: 500
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconComponent sx={{ color: toastConfig.color, fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}

// Hook pour utiliser les toasts facilement
export const useToast = () => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'info',
    duration: 4000
  });

  const showToast = (message, type = 'info', duration = 4000) => {
    setToast({
      open: true,
      message,
      type,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const ToastComponent = () => (
    <Toast
      open={toast.open}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={hideToast}
    />
  );

  return { showToast, ToastComponent };
}; 