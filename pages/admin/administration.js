import { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Grid, Paper, Button, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HotelIcon from '@mui/icons-material/Hotel';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InscriptionsAdmin from '../../components/InscriptionsAdmin';
import AteliersAdmin from '../../components/AteliersAdmin';
import MasterclassAdmin from '../../components/MasterclassAdmin';
import IntervenantsAdmin from '../../components/IntervenantsAdmin';
import NotificationsAdmin from '../../components/NotificationsAdmin';
import StatistiquesAdmin from '../../components/StatistiquesAdmin';
import CNOLDorAdmin from '../../components/CNOLDorAdmin';
import HotelsAdmin from '../../components/HotelsAdmin';
import EntréesAdmin from '../../components/EntréesAdmin';
import ExposantsAdmin from '../../components/ExposantsAdmin';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const drawerWidth = 220;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon /> },
  { text: 'Statistiques', icon: <BarChartIcon /> },
  { text: 'Inscriptions', icon: <PeopleIcon /> },
  { text: 'Exposants', icon: <BusinessIcon /> },
  { text: 'Ateliers', icon: <EventIcon /> },
  { text: 'Masterclass', icon: <EventIcon /> },
  { text: 'Intervenants', icon: <PeopleIcon /> },
  { text: 'Entrées', icon: <EventIcon /> },
  { text: 'CNOL d\'Or', icon: <EmojiEventsIcon /> },
  { text: 'Hôtels', icon: <HotelIcon /> },
  { text: 'Notifications', icon: <NotificationsIcon /> },
  { text: 'Paramètres', icon: <SettingsIcon /> },
];

export default function Administration() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState('Dashboard');
  const [settings, setSettings] = useState({ programme_published: false, ouverture_reservation_atelier: false, ouverture_reservation_masterclass: false });
  const [bulkRunning, setBulkRunning] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Placeholders stats (à remplacer par vraies données)
  const stats = [
    { label: 'Total inscrits', value: '...' },
    { label: 'Validés', value: '...' },
    { label: 'Exposants', value: '...' },
    { label: 'Villes', value: '...' },
    { label: 'Réservations', value: '...' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap>Admin CNOL</Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.text} selected={selected === item.text} onClick={() => { setSelected(item.text); setMobileOpen(false); }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button key="WhatsApp Validés" onClick={() => { window.location.href = '/admin/whatsapp'; setMobileOpen(false); }}>
          <ListItemIcon><WhatsAppIcon style={{ color: '#25D366' }} /></ListItemIcon>
          <ListItemText primary="WhatsApp Validés" />
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center', fontSize: 13, color: 'grey.600' }}>
        CNOL 2025 – Admin<br />Version 1.0<br />Support : cnol.badge@gmail.com
      </Box>
    </Box>
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) setSettings(data);
  }

  function handleToggleProgramme() {
    (async () => {
      const { error } = await supabase.from('settings').update({ programme_published: !settings.programme_published }).eq('id', settings.id || 1);
      if (!error) {
        setSettings(s => ({ ...s, programme_published: !s.programme_published }));
        toast.success(!settings.programme_published ? 'Programme visible côté utilisateur' : 'Programme masqué côté utilisateur');
      } else {
        toast.error('Erreur lors de la mise à jour du paramètre.');
      }
    })();
  }

  function handleToggleAteliers() {
    (async () => {
      const { error } = await supabase.from('settings').update({ ouverture_reservation_atelier: !settings.ouverture_reservation_atelier }).eq('id', settings.id || 1);
      if (!error) {
        setSettings(s => ({ ...s, ouverture_reservation_atelier: !s.ouverture_reservation_atelier }));
        toast.success(!settings.ouverture_reservation_atelier ? 'Réservations ateliers OUVERTES côté public' : 'Réservations ateliers FERMÉES côté public');
      } else {
        toast.error('Erreur lors de la mise à jour du paramètre.');
      }
    })();
  }

  function handleToggleMasterclass() {
    (async () => {
      const { error } = await supabase.from('settings').update({ ouverture_reservation_masterclass: !settings.ouverture_reservation_masterclass }).eq('id', settings.id || 1);
      if (!error) {
        setSettings(s => ({ ...s, ouverture_reservation_masterclass: !s.ouverture_reservation_masterclass }));
        toast.success(!settings.ouverture_reservation_masterclass ? 'Réservations masterclass OUVERTES côté public' : 'Réservations masterclass FERMÉES côté public');
      } else {
        toast.error('Erreur lors de la mise à jour du paramètre.');
      }
    })();
  }

  async function setBulkValidate(action) {
    try {
      const res = await fetch('/api/bulk-validate-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        setBulkRunning(data.running);
        toast.success(data.running ? 'Validation automatique démarrée' : 'Validation automatique en pause');
      } else {
        toast.error(data.error || 'Erreur API');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f6fa' }}>
      {/* Sidebar */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: '#222' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">Administration</Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        {selected === 'Dashboard' && (
          <>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Dashboard d'administration</Typography>
            {/* Tuiles statistiques clés - À remplacer */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary" size="medium" sx={{ minWidth: 160, minHeight: 48, fontSize: 17, borderRadius: 2, boxShadow: 1 }} onClick={() => window.open('/scan-badge', '_blank')}>Scanner badge</Button>
              <Button variant="contained" color="secondary" size="medium" sx={{ minWidth: 160, minHeight: 48, fontSize: 17, borderRadius: 2, boxShadow: 1 }} onClick={() => window.open('/scan-ticket', '_blank')}>Scanner ticket</Button>
              <Button
                variant={settings.programme_published ? 'contained' : 'outlined'}
                color={settings.programme_published ? 'success' : 'warning'}
                size="medium"
                sx={{ minWidth: 160, minHeight: 48, fontSize: 17, borderRadius: 2, boxShadow: 1 }}
                onClick={handleToggleProgramme}
              >
                {settings.programme_published ? 'Masquer le programme' : 'Rendre le programme visible'}
              </Button>
            </Box>
            {/* Accès rapide */}
            <Typography variant="h6" sx={{ mb: 2 }}>Accès rapide</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained" onClick={() => setSelected('Statistiques')}>Voir les statistiques</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained" onClick={() => setSelected('Inscriptions')}>Gérer les inscriptions</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained">Gérer les exposants</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained" onClick={handleToggleAteliers} color={settings.ouverture_reservation_atelier ? 'success' : 'warning'}>{settings.ouverture_reservation_atelier ? 'Fermer réservations ateliers' : 'Ouvrir réservations ateliers'}</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained" onClick={handleToggleMasterclass} color={settings.ouverture_reservation_masterclass ? 'success' : 'warning'}>{settings.ouverture_reservation_masterclass ? 'Fermer réservations masterclass' : 'Ouvrir réservations masterclass'}</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained" onClick={() => setSelected('Intervenants')}>Gérer les intervenants</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button fullWidth variant="contained" color="info" href="/admin/badges-bulk">Badges en masse (CSV)</Button></Grid>
            </Grid>
            {/* Placeholder logs récents */}
            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Dernières actions</Typography>
            <Paper sx={{ p: 2, minHeight: 80 }}>Aucune action récente.</Paper>
          </>
        )}
        {selected === 'Inscriptions' && <InscriptionsAdmin />}
        {selected === 'Ateliers' && <AteliersAdmin />}
        {selected === 'Masterclass' && <MasterclassAdmin />}
        {selected === 'Intervenants' && <IntervenantsAdmin />}
        {selected === 'Entrées' && <EntréesAdmin />}
        {selected === 'Notifications' && <NotificationsAdmin />}
        {selected === 'Statistiques' && <StatistiquesAdmin />}
        {selected === 'CNOL d\'Or' && <CNOLDorAdmin />}
        {selected === 'Hôtels' && <HotelsAdmin />}
        {selected === 'Exposants' && <ExposantsAdmin />}
      </Box>
    </Box>
  );
} 