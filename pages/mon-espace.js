import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stack, 
  Divider, 
  Alert, 
  Card, 
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  CircularProgress,
  Fade,
  FormGroup
} from '@mui/material';
import QRCode from 'qrcode.react';
import Link from 'next/link';
import {
  QrCodeScanner,
  Notifications,
  NotificationsOff,
  Person,
  Event,
  Hotel,
  LocationOn,
  Download,
  Logout,
  ContactPhone,
  School,
  EmojiEvents,
  Map,
  AdminPanelSettings,
  BarChart,
  Group,
  Delete
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';
import { ThemeToggle } from '../components/ThemeProvider';
import LoadingSpinner from '../components/LoadingSpinner';

// On charge le QRCodeScanner de façon dynamique pour éviter les erreurs de build
const QRCodeScanner = dynamic(() => import('../components/QRCodeScanner'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

export const getServerSideProps = async ({ req }) => {
  // Vérifier si l'utilisateur est connecté via la session
  const sessionCookie = req.cookies['cnol-session'];
  
  if (!sessionCookie) {
    return {
      redirect: {
        destination: '/identification',
        permanent: false,
      },
    };
  }

  try {
    // Décoder la session
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
    
    if (!sessionData || !sessionData.id) {
      return {
        redirect: {
          destination: '/identification',
          permanent: false,
        },
      };
    }

    // 1. Récupérer les données de base de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('inscription')
      .select('*')
      .eq('id', sessionData.id)
      .single();

    if (userError || !userData) {
      return {
        redirect: {
          destination: '/identification?error=user_not_found',
          permanent: false,
        },
      };
    }
    
    // 2. Récupérer les réservations d'ateliers par email
    const { data: ateliersData, error: ateliersError } = await supabase
        .from('reservations_ateliers')
        .select('*, ateliers(*)')
        .eq('email', userData.email);

    // 3. Récupérer les réservations de masterclass par email
    const { data: masterclassData, error: masterclassError } = await supabase
        .from('reservations_masterclass')
        .select('*, masterclasses:masterclass(*)')
        .eq('email', userData.email);

    if (ateliersError || masterclassError) {
        console.error("Erreur de récupération des réservations:", ateliersError, masterclassError);
    }
    
    // 4. Combiner les données et les passer au composant
    const userWithReservations = {
      ...userData,
      reservations_ateliers: ateliersData || [],
      reservations_masterclass: masterclassData || [],
    };

    return {
      props: {
        user: userWithReservations,
      },
    };
  } catch (error) {
    console.error('Erreur de session:', error);
    return {
      redirect: {
        destination: '/identification',
        permanent: false,
      },
    };
  }
};

export default function MonEspace({ user }) {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clocheAnim, setClocheAnim] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nom: user.nom, prenom: user.prenom, fonction: user.fonction || '', telephone: user.telephone || '', email: user.email });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Détermine si l'utilisateur a le droit de voir les ateliers/masterclass
  const isAllowedForWorkshops = user && (user.fonction === 'Opticien' || user.fonction === 'Ophtalmologue');

  // Bouton Admin visible uniquement pour les admins
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    // Vérifier les permissions de notifications
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Charger les paramètres
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) setSettings(data);
    };
    fetchSettings();

    // Charger les contacts collectés
    const fetchContacts = async () => {
      const { data, error } = await supabase.rpc('get_user_contacts', {
        p_collector_id: user.id,
      });

      if (error) {
        console.error('Erreur chargement contacts:', error);
      } else {
        setContacts(data || []);
      }
    };
    fetchContacts();

    // Charger les notifications reçues
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setNotifications(data);
    };
    fetchNotifications();
  }, [user.id]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/identification');
  };

  const handleNotificationToggle = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert("Les notifications ne sont pas supportées par votre navigateur.");
      return;
    }

    // Fonction utilitaire pour convertir la clé VAPID
    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
    
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    if (Notification.permission === 'denied') {
      alert("Vous avez bloqué les notifications. Veuillez les autoriser dans les paramètres de votre navigateur.");
      return;
    }

    // Demander la permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert("Permission de notification non accordée.");
      setNotificationsEnabled(false);
      return;
    }
    
    setNotificationsEnabled(true);
    const toastId = toast.loading('Activation des notifications...');

    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('La clé VAPID publique n\'est pas configurée.');
      }
      
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Enregistrer le Service Worker
      const sw = await navigator.serviceWorker.ready;
      
      // S'abonner aux notifications push
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Envoyer l'abonnement au serveur
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'abonnement côté serveur.');
      }

      toast.success('Vous êtes maintenant abonné aux notifications !', { id: toastId });

    } catch (error) {
      console.error("Erreur lors de l'abonnement aux notifications:", error);
      toast.error(`Erreur: ${error.message}`, { id: toastId });
      setNotificationsEnabled(false);
    }
  };

  const handleDownloadPdfBadge = async () => {
    // Vérifier que l'utilisateur est validé avant de permettre le téléchargement
    if (!user.valide) {
      alert('Votre inscription doit être validée par l\'administrateur avant de pouvoir télécharger votre badge.');
      return;
    }

    try {
      // Afficher un indicateur de chargement
      alert('Génération de votre badge PDF en cours... Veuillez patienter.');

      setLoading(true);

      const response = await fetch(`/api/generatedbadge?id=${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'La génération du badge a échoué.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `badge-cnol2025-${user.nom}-${user.prenom}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement du badge PDF:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ajout pour marquer comme lu
  const markAllNotificationsRead = async () => {
    // Optimiste : on met à jour localement
    setNotifications((prev) => prev.map(n => ({ ...n, lu: true })));
    // Appel API pour marquer comme lu côté serveur (à adapter selon votre API)
    await fetch('/api/notifications/mark-all-read', { method: 'POST', body: JSON.stringify({ userId: user.id }) });
  };

  const handleNotificationClick = (notif) => {
    if (notif.url) window.open(notif.url, '_blank');
    // Marquer comme lu localement
    setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, lu: true } : n));
    // Appel API pour marquer comme lu côté serveur (à adapter)
    fetch('/api/notifications/mark-read', { method: 'POST', body: JSON.stringify({ id: notif.id }) });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 } }}>
      {isAdmin && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="info"
            startIcon={<AdminPanelSettings />}
            href="/admin"
            sx={{ fontWeight: 'bold', letterSpacing: 1 }}
          >
            Espace Admin
          </Button>
        </Box>
      )}
      {/* En-tête avec infos utilisateur */}
      <Paper sx={{ p: 3, mb: 2, borderRadius: 4, boxShadow: 1, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bonjour, {user.prenom?.toUpperCase()} {user.nom?.toUpperCase()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.participant_type} • {user.email}
          </Typography>
          {user.fonction && (
            <Typography variant="body2" color="text.secondary">
              {user.fonction}
            </Typography>
          )}
          <Chip 
            label={user.valide ? "Compte validé" : "En attente de validation"} 
            color={user.valide ? "success" : "warning"}
            sx={{ mt: 1, mb: 2 }}
          />
          <Button variant="outlined" color="primary" size="small" sx={{ mt: 1, mb: 1 }} onClick={() => setEditOpen(true)}>
            Modifier mon profil
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationDropdown
            notifications={notifications}
            onMarkAllRead={markAllNotificationsRead}
            onNotificationClick={handleNotificationClick}
          />
          <ThemeToggle />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 2, borderRadius: 4, boxShadow: 1, background: '#f7f7f7' }}>
        <Typography variant="h6" gutterBottom>
          <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
          Votre QR Code d'accès
        </Typography>
        {user.valide ? (
          <Stack alignItems="center" spacing={2}>
            <QRCode id="qr-code" value={user.identifiant_badge || user.email} size={200} />
            <Typography variant="body2" color="text.secondary">
              Code: {user.identifiant_badge || 'N/A'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              sx={{
                width: '100%',
                borderRadius: 3,
                fontWeight: 'bold',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                letterSpacing: 1,
                py: 1.2,
                mt: 2,
                textTransform: 'none'
              }}
              onClick={handleDownloadPdfBadge}
            >
              TÉLÉCHARGER MON BADGE (PDF)
            </Button>
          </Stack>
        ) : (
          <Alert severity="warning">
            Votre inscription est en attente de validation. Votre badge sera disponible ici une fois votre compte approuvé.
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 2, borderRadius: 4, boxShadow: 1, background: '#f7f7f7' }}>
        <Typography variant="h6" gutterBottom>
          <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
          Programme général du congrès
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Consultez le programme complet des conférences et sessions plénières (sans réservation nécessaire).
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          href="/programme"
          sx={{ fontWeight: 'bold', borderRadius: 3, letterSpacing: 1, py: 1.2, textTransform: 'none' }}
          fullWidth
        >
          Voir le programme général
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Recevez des notifications importantes sur votre appareil.
              </Typography>
              <Switch
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                name="notifications"
                color="primary"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Mes Réservations Ateliers - Condition d'affichage ajoutée */}
        {user.valide && isAllowedForWorkshops && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                Mes Réservations Ateliers
              </Typography>
              {user.reservations_ateliers && user.reservations_ateliers.filter(r => r.statut === 'confirmé').length > 0 ? (
                <List>
                  {user.reservations_ateliers.filter(r => r.statut === 'confirmé').map((reservation, idx) => (
                    <Fade in={true} timeout={500 + idx * 80} key={reservation.id}>
                      <Paper sx={{ p: 2, mb: 2, borderRadius: 4, boxShadow: 1, background: '#f7f7f7' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Event sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                            {reservation.ateliers?.titre}
                          </Typography>
                          <Chip label="confirmé" color="success" size="small" sx={{ ml: 1 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {new Date(reservation.ateliers?.date_heure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                        </Typography>
                        {reservation.ateliers?.intervenant && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Intervenant : {reservation.ateliers.intervenant}
                          </Typography>
                        )}
                        {reservation.annulation_validee ? (
                          <Chip label="Réservation annulée" color="error" sx={{ mt: 1 }} />
                        ) : reservation.annulation_demandee ? (
                          <Chip label="Annulation en attente" color="warning" sx={{ mt: 1 }} />
                        ) : (
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ mt: 1, mb: 1 }}
                            onClick={async () => {
                              await supabase.from('reservations_ateliers').update({ annulation_demandee: true }).eq('id', reservation.id);
                              toast.success('Demande d\'annulation envoyée');
                              window.location.reload();
                            }}
                          >
                            Demander l'annulation
                          </Button>
                        )}
                        {!reservation.annulation_validee && !reservation.annulation_demandee && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Download />}
                            sx={{ width: '100%', borderRadius: 3, fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1.05rem' }, letterSpacing: 1, py: 1.2, mt: 2, textTransform: 'none' }}
                            onClick={async () => {
                              const toastId = toast.loading('Génération du ticket...');
                              try {
                                const res = await fetch(`/api/download-ticket-atelier?id=${reservation.id}`);
                                if (!res.ok) {
                                  const errorData = await res.json();
                                  throw new Error(errorData.message || 'Erreur lors de la génération du ticket');
                                }
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                const titreSafe = reservation.ateliers?.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                link.setAttribute('download', `ticket-atelier-${titreSafe}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                toast.success('Ticket téléchargé !', { id: toastId });
                              } catch (e) {
                                console.error("Erreur téléchargement ticket:", e);
                                toast.error(`Erreur: ${e.message}`, { id: toastId });
                              }
                            }}
                          >
                            TÉLÉCHARGER LE TICKET
                          </Button>
                        )}
                      </Paper>
                    </Fade>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun atelier validé
                </Typography>
              )}
              {settings.ouverture_reservation_atelier && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: '100%',
                    borderRadius: 999,
                    fontWeight: 'bold',
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    letterSpacing: 1,
                    py: 1.2,
                    my: 1.5,
                    textTransform: 'none',
                    whiteSpace: 'normal',
                    px: 2
                  }}
                  href="/reservation-ateliers"
                >
                  RÉSERVER UN ATELIER
                </Button>
              )}
            </Paper>
          </Grid>
        )}

        {/* Mes Réservations Masterclass - Condition d'affichage ajoutée */}
        {user.valide && isAllowedForWorkshops && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                Mes Réservations Masterclass
              </Typography>
              {user.reservations_masterclass && user.reservations_masterclass.filter(r => r.statut === 'confirmé').length > 0 ? (
                <List>
                  {user.reservations_masterclass.filter(r => r.statut === 'confirmé').map((reservation, idx) => (
                    <Fade in={true} timeout={500 + idx * 80} key={reservation.id}>
                      <Paper sx={{ p: 2, mb: 2, borderRadius: 4, boxShadow: 1, background: '#f7f7f7' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Event sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                            {reservation.masterclasses?.titre}
                          </Typography>
                          <Chip label="confirmé" color="success" size="small" sx={{ ml: 1 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {new Date(reservation.masterclasses?.date_heure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                        </Typography>
                        {reservation.masterclasses?.intervenant && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Intervenant : {reservation.masterclasses.intervenant}
                          </Typography>
                        )}
                        {reservation.annulation_validee ? (
                          <Chip label="Réservation annulée" color="error" sx={{ mt: 1 }} />
                        ) : reservation.annulation_demandee ? (
                          <Chip label="Annulation en attente" color="warning" sx={{ mt: 1 }} />
                        ) : (
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ mt: 1, mb: 1 }}
                            onClick={async () => {
                              await supabase.from('reservations_masterclass').update({ annulation_demandee: true }).eq('id', reservation.id);
                              toast.success('Demande d\'annulation envoyée');
                              window.location.reload();
                            }}
                          >
                            Demander l'annulation
                          </Button>
                        )}
                        {!reservation.annulation_validee && !reservation.annulation_demandee && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Download />}
                            sx={{ width: '100%', borderRadius: 3, fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1.05rem' }, letterSpacing: 1, py: 1.2, mt: 2, textTransform: 'none' }}
                            onClick={async () => {
                              const toastId = toast.loading('Génération du ticket...');
                              try {
                                const res = await fetch(`/api/download-ticket-masterclass?id=${reservation.id}`);
                                if (!res.ok) {
                                  const errorData = await res.json();
                                  throw new Error(errorData.message || 'Erreur lors de la génération du ticket');
                                }
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                const titreSafe = reservation.masterclasses?.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                link.setAttribute('download', `ticket-masterclass-${titreSafe}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                toast.success('Ticket téléchargé !', { id: toastId });
                              } catch (e) {
                                console.error("Erreur téléchargement ticket:", e);
                                toast.error(`Erreur: ${e.message}`, { id: toastId });
                              }
                            }}
                          >
                            TÉLÉCHARGER LE TICKET
                          </Button>
                        )}
                      </Paper>
                    </Fade>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucune masterclass validée
                </Typography>
              )}
              {settings.ouverture_reservation_masterclass && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: '100%',
                    borderRadius: 999,
                    fontWeight: 'bold',
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    letterSpacing: 1,
                    py: 1.2,
                    my: 1.5,
                    textTransform: 'none',
                    whiteSpace: 'normal',
                    px: 2
                  }}
                  href="/reservation-masterclass"
                >
                  RÉSERVER UNE MASTERCLASS
                </Button>
              )}
            </Paper>
          </Grid>
        )}

        {/* Scanner Badge */}
        {user.valide && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                Scanner un Contact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Scannez le badge d'un autre participant pour échanger vos coordonnées.
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                href="/scan-contact"
                startIcon={<QrCodeScanner />}
              >
                Ouvrir le scanner
              </Button>
            </Paper>
          </Grid>
        )}

        {/* Contacts Collectés */}
        {user.valide && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
                Contacts Collectés
                <Badge badgeContent={contacts.length} color="primary" sx={{ ml: 2 }} />
              </Typography>
              {contacts.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {contacts.map((contact, idx) => (
                    <Fade in={true} timeout={500 + idx * 60} key={contact.id || idx}>
                      <ListItem alignItems="flex-start" divider={idx < contacts.length - 1}>
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${contact.prenom} ${contact.nom}`}
                          secondary={
                            <>
                              <Typography
                                sx={{ display: 'block' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {contact.fonction}
                              </Typography>
                              {`${contact.email} • ${contact.telephone || 'N/A'}`}
                            </>
                          }
                        />
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Aucun contact collecté. Scannez un badge pour commencer !
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Postuler CNOL d'Or - Condition d'affichage ajoutée */}
        {user.valide && user.fonction === 'Opticien' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                CNOL d'Or 2025
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Postulez pour le prix CNOL d'Or 2025
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                href="/cnol-dor"
                startIcon={<EmojiEvents />}
              >
                Postuler au CNOL d'Or
              </Button>
            </Paper>
          </Grid>
        )}

        {/* Réserver un Hôtel */}
        {user.valide && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Hotel sx={{ mr: 1, verticalAlign: 'middle' }} />
                Réserver un Hôtel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Consultez et réservez dans nos hôtels partenaires
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                href="/hotels"
                startIcon={<Hotel />}
              >
                Voir les hôtels partenaires
              </Button>
            </Paper>
          </Grid>
        )}

        {/* Localisation Événement */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Localisation de l'Événement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              CNOL 2025 - Rabat, Maroc
            </Typography>
            <Box sx={{ height: 300, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.556696027705!2d-6.870305288928752!3d33.97823197307313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76cdca2be509f%3A0x5737e47164ae0407!2sFondation%20Mohammed%20VI%20de%20Promotion%20des%20Oeuvres%20Sociales%20de%20l'Education%20et%20de%20Formation!5e0!3m2!1sfr!2sma!4v1750541270419!5m2!1sfr!2sma"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3, mt: 4, borderRadius: 4, boxShadow: 1, background: '#f7f7f7' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          <BarChart sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Mes statistiques
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, boxShadow: 0 }}>
              <School sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{user.reservations_ateliers?.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Ateliers réservés</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, boxShadow: 0 }}>
              <School sx={{ color: 'secondary.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{user.reservations_masterclass?.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Masterclass réservées</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, boxShadow: 0 }}>
              <Group sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{contacts.length}</Typography>
              <Typography variant="body2" color="text.secondary">Contacts collectés</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, boxShadow: 0 }}>
              <Notifications sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{notifications.length}</Typography>
              <Typography variant="body2" color="text.secondary">Notifications reçues</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3, mt: 4, borderRadius: 4, boxShadow: 1, background: '#f7f7f7' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Mes consentements
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={user.consent_notifications} onChange={async (e) => {
              await supabase.from('inscription').update({ consent_notifications: e.target.checked }).eq('id', user.id);
              toast.success('Préférence enregistrée');
              window.location.reload();
            }} />}
            label="Je souhaite recevoir des notifications push"
          />
          <FormControlLabel
            control={<Switch checked={user.consent_emails} onChange={async (e) => {
              await supabase.from('inscription').update({ consent_emails: e.target.checked }).eq('id', user.id);
              toast.success('Préférence enregistrée');
              window.location.reload();
            }} />}
            label="J'accepte de recevoir des emails d'information"
          />
          <FormControlLabel
            control={<Switch checked={user.consent_partners} onChange={async (e) => {
              await supabase.from('inscription').update({ consent_partners: e.target.checked }).eq('id', user.id);
              toast.success('Préférence enregistrée');
              window.location.reload();
            }} />}
            label="J'accepte le partage de mes données avec les partenaires"
          />
          <FormControlLabel
            control={<Switch checked={user.consent_stats} onChange={async (e) => {
              await supabase.from('inscription').update({ consent_stats: e.target.checked }).eq('id', user.id);
              toast.success('Préférence enregistrée');
              window.location.reload();
            }} />}
            label="J'accepte l'utilisation de mes données à des fins statistiques anonymes"
          />
        </FormGroup>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button variant="contained" color="info" href="/faq" sx={{ fontWeight: 'bold', borderRadius: 3, letterSpacing: 1, py: 1.2, px: 4, textTransform: 'none', mr: 2 }}>
          Aide / FAQ
        </Button>
        <Button variant="outlined" color="error" startIcon={<Delete />} sx={{ fontWeight: 'bold', borderRadius: 3, letterSpacing: 1, py: 1.2, px: 4, textTransform: 'none' }} onClick={() => setDeleteOpen(true)}>
          Supprimer mon compte
        </Button>
      </Box>
      <LoadingSpinner open={loading} />
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Fade}>
        <DialogTitle>Modifier mon profil</DialogTitle>
        <DialogContent>
          <TextField label="Nom" name="nom" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Prénom" name="prenom" value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Fonction" name="fonction" value={editForm.fonction} onChange={e => setEditForm(f => ({ ...f, fonction: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Téléphone" name="telephone" value={editForm.telephone} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" name="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={editLoading} onClick={async () => {
            setEditLoading(true);
            const { error } = await supabase.from('inscription').update(editForm).eq('id', user.id);
            setEditLoading(false);
            if (!error) {
              toast.success('Profil mis à jour !');
              setEditOpen(false);
              // Optionnel : recharger la page ou les infos utilisateur
              window.location.reload();
            } else {
              toast.error('Erreur lors de la mise à jour');
            }
          }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Fade}>
        <DialogTitle>Supprimer mon compte</DialogTitle>
        <DialogContent>
          <Typography color="error" fontWeight="bold" sx={{ mb: 2 }}>
            Cette action est irréversible. Toutes vos données seront supprimées ou anonymisées.
          </Typography>
          <Typography>Êtes-vous sûr de vouloir continuer ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" disabled={deleteLoading} onClick={async () => {
            setDeleteLoading(true);
            const res = await fetch('/api/delete-account', { method: 'POST' });
            setDeleteLoading(false);
            if (res.ok) {
              toast.success('Compte supprimé.');
              window.location.href = '/identification';
            } else {
              toast.error('Erreur lors de la suppression du compte.');
            }
          }}>
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
