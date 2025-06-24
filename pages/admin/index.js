import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Alert, 
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  AppBar,
  Toolbar
} from '@mui/material';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ReservationsAteliers = dynamic(() => import('./reservations-ateliers'), { ssr: false });
const ReservationsMasterclass = dynamic(() => import('./reservations-masterclass'), { ssr: false });
const AnnulationsAteliers = dynamic(() => import('./reservations-ateliers'), { ssr: false });
const AnnulationsMasterclass = dynamic(() => import('./reservations-masterclass'), { ssr: false });
// Ajoute d'autres sections si besoin (ex: utilisateurs)

const TABS = [
  { label: 'Réservations Ateliers', component: <ReservationsAteliers /> },
  { label: 'Réservations Masterclass', component: <ReservationsMasterclass /> },
  { label: 'Annulations Ateliers', component: <AnnulationsAteliers /> },
  { label: 'Annulations Masterclass', component: <AnnulationsMasterclass /> },
  // { label: 'Utilisateurs', component: <Utilisateurs /> },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Statistiques globales
      const { data: inscriptions } = await supabase
        .from('inscription')
        .select('*');
      
      const { data: leads } = await supabase
        .from('leads')
        .select('*');
      
      const { data: exposants } = await supabase
        .from('exposants')
        .select('*');
      
      const { data: staff } = await supabase
        .from('staff_exposant')
        .select('*');

      setStats({
        totalInscriptions: inscriptions?.length || 0,
        totalLeads: leads?.length || 0,
        totalExposants: exposants?.length || 0,
        totalStaff: staff?.length || 0,
        leadsAujourdhui: leads?.filter(l => {
          const today = new Date().toISOString().split('T')[0];
          return l.created_at?.startsWith(today);
        }).length || 0
      });
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const quickActions = [
    { title: 'Gérer les exposants', path: '/admin/exposants', color: 'primary' },
    { title: 'Créer un exposant', path: '/admin/creer-exposant', color: 'secondary' },
    { title: 'Notifications', path: '/admin/notifications', color: 'success' },
    { title: 'Statistiques', path: '/admin/statistiques', color: 'info' },
    { title: 'Programme', path: '/admin/programme', color: 'warning' },
    { title: 'Ateliers', path: '/admin/ateliers', color: 'error' },
    { title: 'Masterclass', path: '/admin/masterclass', color: 'primary' },
    { title: 'Hôtels', path: '/admin/hotels', color: 'secondary' },
  ];

  const renderQuickActions = () => (
    <Grid container spacing={isMobile ? 1 : 2}>
      {quickActions.map((action, index) => (
        <Grid item xs={isMobile ? 6 : 3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' },
              borderRadius: isMobile ? 2 : 1
            }}
            onClick={() => router.push(action.path)}
          >
            <CardContent sx={{ 
              p: isMobile ? 2 : 2,
              textAlign: 'center'
            }}>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                sx={{ fontWeight: 'bold' }}
              >
                {action.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderStats = () => (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid item xs={isMobile ? 6 : 3}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: 'center',
          borderRadius: isMobile ? 3 : 2
        }}>
          <Typography variant={isMobile ? "h4" : "h3"} color="primary" sx={{ fontWeight: 'bold' }}>
            {stats.totalInscriptions}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"}>
            Inscriptions
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={isMobile ? 6 : 3}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: 'center',
          borderRadius: isMobile ? 3 : 2
        }}>
          <Typography variant={isMobile ? "h4" : "h3"} color="success.main" sx={{ fontWeight: 'bold' }}>
            {stats.totalLeads}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"}>
            Contacts collectés
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={isMobile ? 6 : 3}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: 'center',
          borderRadius: isMobile ? 3 : 2
        }}>
          <Typography variant={isMobile ? "h4" : "h3"} color="info.main" sx={{ fontWeight: 'bold' }}>
            {stats.totalExposants}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"}>
            Exposants
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={isMobile ? 6 : 3}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: 'center',
          borderRadius: isMobile ? 3 : 2
        }}>
          <Typography variant={isMobile ? "h4" : "h3"} color="warning.main" sx={{ fontWeight: 'bold' }}>
            {stats.leadsAujourdhui}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"}>
            Contacts aujourd'hui
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress size={isMobile ? 60 : 80} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: isMobile ? '100%' : 1200, 
      mx: 'auto', 
      p: isMobile ? 1 : 3 
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        sx={{ 
          textAlign: isMobile ? 'center' : 'left',
          mb: isMobile ? 2 : 3,
          fontWeight: 'bold'
        }}
      >
        Dashboard Administrateur
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isMobile ? (
        // Version mobile avec onglets
        <Box>
          <AppBar position="static" sx={{ mb: 2, borderRadius: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                '& .MuiTab-root': { 
                  fontSize: '0.9rem',
                  minHeight: 48
                } 
              }}
            >
              <Tab label="Vue d'ensemble" />
              <Tab label="Actions rapides" />
            </Tabs>
          </AppBar>

          {activeTab === 0 && (
            <Box>
              {renderStats()}
              <Paper sx={{ 
                p: 2, 
                mt: 3,
                borderRadius: 3
              }}>
                <Typography variant="h6" gutterBottom>
                  Actions rapides
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => router.push('/admin/exposants')}
                    sx={{ py: 2, fontSize: '1.1rem', borderRadius: 3 }}
                    fullWidth
                  >
                    Gérer les exposants
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => router.push('/admin/notifications')}
                    sx={{ py: 2, fontSize: '1.1rem', borderRadius: 3 }}
                    fullWidth
                  >
                    Notifications
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => router.push('/admin/statistiques')}
                    sx={{ py: 2, fontSize: '1.1rem', borderRadius: 3 }}
                    fullWidth
                  >
                    Statistiques détaillées
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {renderQuickActions()}
            </Box>
          )}
        </Box>
      ) : (
        // Version desktop
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistiques globales
            </Typography>
            {renderStats()}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            {renderQuickActions()}
          </Paper>
        </Box>
      )}
    </Box>
  );
} 