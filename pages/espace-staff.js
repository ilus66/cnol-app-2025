import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';

export default function EspaceStaff() {
  const [badgeCode, setBadgeCode] = useState('');
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ scans: 0, contacts: 0 });
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('staff_exposant')
      .select('*, exposants(nom)')
      .eq('badge_code', badgeCode)
      .eq('espace_staff_active', true)
      .single();
    if (error || !data) {
      setError('Badge invalide ou désactivé');
      setLoading(false);
      return;
    }
    setStaff(data);
    // Charger les stats depuis la table leads
    const { data: scans } = await supabase
      .from('leads')
      .select('*')
      .eq('staff_id', data.id);
    setStats({ 
      scans: scans?.length || 0, 
      contacts: scans?.length || 0 
    });
    setLoading(false);
  };

  const handleScanVisiteur = () => {
    router.push(`/scan-stand?stand_badge=${staff.badge_code}&staff_id=${staff.id}`);
  };

  const handleVoirContacts = () => {
    router.push(`/mes-contacts?staff_id=${staff.id}`);
  };

  if (staff) {
    return (
      <Box sx={{ 
        maxWidth: isMobile ? '100%' : 800, 
        mx: 'auto', 
        my: isMobile ? 2 : 4,
        px: isMobile ? 2 : 0
      }}>
        <Paper sx={{ p: isMobile ? 2 : 3, mb: isMobile ? 2 : 3, borderRadius: isMobile ? 3 : 2 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight="bold" 
            gutterBottom
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Espace staff - {staff.prenom} {staff.nom}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            gutterBottom
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Stand : {staff.exposants?.nom}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Fonction : {staff.fonction}
          </Typography>
        </Paper>

        <Paper sx={{ p: isMobile ? 2 : 3, mb: isMobile ? 2 : 3, borderRadius: isMobile ? 3 : 2 }}>
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            gutterBottom
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Mes statistiques
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 2 : 3,
            justifyContent: isMobile ? 'space-around' : 'flex-start'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                {stats.scans}
              </Typography>
              <Typography variant="body2">Scans effectués</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                {stats.contacts}
              </Typography>
              <Typography variant="body2">Contacts collectés</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: isMobile ? 3 : 2 }}>
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            gutterBottom
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Actions
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 2
          }}>
            <Button 
              variant="contained" 
              onClick={handleScanVisiteur}
              sx={{ 
                py: isMobile ? 2 : 1.5,
                fontSize: isMobile ? '1.1rem' : 'inherit',
                borderRadius: isMobile ? 3 : 2
              }}
              fullWidth={isMobile}
            >
              Scanner un visiteur
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleVoirContacts}
              sx={{ 
                py: isMobile ? 2 : 1.5,
                fontSize: isMobile ? '1.1rem' : 'inherit',
                borderRadius: isMobile ? 3 : 2
              }}
              fullWidth={isMobile}
            >
              Voir mes contacts
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: isMobile ? '100%' : 400, 
      mx: 'auto', 
      my: isMobile ? 2 : 4,
      px: isMobile ? 2 : 0
    }}>
      <Paper sx={{ p: isMobile ? 3 : 3, borderRadius: isMobile ? 3 : 2 }}>
        <Typography 
          variant={isMobile ? "h5" : "h5"} 
          fontWeight="bold" 
          gutterBottom
          sx={{ textAlign: 'center' }}
        >
          Accès espace staff
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Code badge"
            value={badgeCode}
            onChange={(e) => setBadgeCode(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            size={isMobile ? "large" : "medium"}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading}
            sx={{
              py: isMobile ? 2 : 1.5,
              fontSize: isMobile ? '1.2rem' : 'inherit',
              borderRadius: isMobile ? 3 : 2
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
} 