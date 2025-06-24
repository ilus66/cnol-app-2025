import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert, 
  useTheme, 
  useMediaQuery,
  Snackbar
} from '@mui/material';
import { Notifications, Close } from '@mui/icons-material';

export default function MobileNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState('default');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if (!('Notification' in window)) {
      return;
    }

    // Vérifier la permission actuelle
    setPermission(Notification.permission);

    // Afficher le prompt si la permission n'est pas encore demandée
    if (Notification.permission === 'default') {
      // Attendre un peu avant d'afficher le prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === 'granted') {
        setSnackbarMessage('Notifications activées ! Vous recevrez les mises à jour importantes.');
        setShowSnackbar(true);
        
        // Envoyer une notification de test
        new Notification('CNOL 2025', {
          body: 'Notifications activées avec succès !',
          icon: '/logo-cnol.png'
        });
      } else {
        setSnackbarMessage('Notifications désactivées. Vous pouvez les activer dans les paramètres de votre navigateur.');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      setSnackbarMessage('Erreur lors de l\'activation des notifications.');
      setShowSnackbar(true);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  if (!isMobile || permission !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 80, // Au-dessus du SpeedDial
          left: 16,
          right: 16,
          zIndex: 999,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            boxShadow: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications sx={{ mr: 1, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Activer les notifications
            </Typography>
            <Button
              onClick={handleClose}
              sx={{
                ml: 'auto',
                color: 'white',
                minWidth: 'auto',
                p: 0.5,
              }}
            >
              <Close />
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
            Recevez les mises à jour importantes, les rappels d'événements et les notifications de votre stand en temps réel.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleRequestPermission}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                borderRadius: 2,
              }}
            >
              Activer
            </Button>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                borderRadius: 2,
              }}
            >
              Plus tard
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={permission === 'granted' ? 'success' : 'info'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
} 