import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Box, Typography, Button, CircularProgress, List, ListItem, ListItemText,
  Alert, Paper
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';

export const getServerSideProps = async ({ req }) => {
  const sessionCookie = req.cookies['cnol-session'];
  if (!sessionCookie) {
    return { redirect: { destination: '/identification', permanent: false } };
  }
  
  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
    const { data: user, error } = await supabase
      .from('inscription')
      .select('*')
      .eq('id', sessionData.id)
      .single();

    if (error || !user) {
      return { redirect: { destination: '/identification?error=user_not_found', permanent: false } };
    }
    
    if (user.fonction !== 'Opticien' && user.fonction !== 'Ophtalmologue') {
        return {
            redirect: { destination: '/mon-espace?error=access_denied', permanent: false },
        };
    }

    return { props: { user } };
  } catch (error) {
    return { redirect: { destination: '/identification', permanent: false } };
  }
};

export default function ReservationAteliers({ user }) {
  const [ateliers, setAteliers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ ouverture_reservation_atelier: false });

  useEffect(() => {
    fetchData();
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, [user.email]);

  const fetchData = async () => {
    setLoading(true);

    const { data: ateliersData, error: ateliersError } = await supabase
      .from('ateliers')
      .select(`
        *,
        reservations_ateliers ( statut )
      `)
      .order('date_heure');

    if (ateliersData) {
        const transformedAteliers = ateliersData.map(atelier => {
            const placesPrises = atelier.reservations_ateliers.filter(r => r.statut === 'confirmé').length;
            return { ...atelier, placesPrises };
        });
        setAteliers(transformedAteliers);
    }
    
    const { data: reservationsData } = await supabase
      .from('reservations_ateliers')
      .select('atelier_id, statut')
      .eq('email', user.email);
      
    if (reservationsData) setReservations(reservationsData);

    setLoading(false);
  };

  const handleReserver = async (atelierId) => {
    const toastId = toast.loading('Réservation en cours...');
    
    const response = await fetch('/api/reservation-atelier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        atelier_id: atelierId,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone
      })
    });

    const data = await response.json();
    if (response.ok) {
      toast.success(data.message || 'Demande de réservation envoyée !', { id: toastId });
      fetchData();
    } else {
      toast.error(data.message || 'Erreur lors de la réservation.', { id: toastId });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  
  if (!settings.ouverture_reservation_atelier) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Les réservations d'ateliers ne sont pas encore ouvertes.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Toaster position="top-right" />
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Réserver un Atelier</Typography>
        <Typography variant="body1" color="text.secondary">
            Bonjour {user.prenom}, sélectionnez un atelier pour réserver votre place. Les places sont limitées.
        </Typography>
      </Paper>
      <List>
        {ateliers.map((atelier) => {
          const reservation = reservations.find(r => r.atelier_id === atelier.id);
          const placesPrises = atelier.placesPrises || 0;
          const placesRestantes = (atelier.places || 0) - placesPrises;
          const isFull = placesRestantes <= 0;

          let buttonText = 'Réserver';
          let buttonColor = 'primary';
          let buttonDisabled = isFull;

          if (reservation) {
            if (reservation.statut === 'confirmé') {
              buttonText = 'Confirmé';
              buttonColor = 'success';
              buttonDisabled = true;
            } else if (reservation.statut === 'en attente') {
              buttonText = 'En attente';
              buttonColor = 'warning';
              buttonDisabled = true;
            }
          } else if (isFull) {
            buttonText = 'Complet';
          }

          return (
            <ListItem key={atelier.id} divider sx={{ opacity: (isFull && !reservation) ? 0.6 : 1 }}>
              <ListItemText
                primary={`${atelier.titre} — ${atelier.intervenant}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {new Date(atelier.date_heure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                    </Typography>
                    <br />
                    Salle: {atelier.salle} | Places restantes: {placesRestantes}
                  </>
                }
              />
              <Button
                variant="contained"
                onClick={() => handleReserver(atelier.id)}
                disabled={buttonDisabled}
                color={buttonColor}
              >
                {buttonText}
              </Button>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
