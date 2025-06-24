import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { toast } from 'react-hot-toast';

export default function AdminReservationsMasterclass() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motif, setMotif] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reservations_masterclass')
      .select('*, masterclasses:masterclass(*), user:inscription(*)')
      .eq('annulation_demandee', true)
      .eq('annulation_validee', false)
      .order('created_at', { ascending: false });
    setReservations(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleValidate = async (res) => {
    setSelected(res);
    setOpen(true);
  };

  const confirmValidate = async () => {
    setLoading(true);
    await supabase.from('reservations_masterclass').update({ annulation_validee: true, annulation_date: new Date().toISOString(), annulation_motif: motif }).eq('id', selected.id);
    // Notification à l'utilisateur
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selected.user.email,
        subject: 'Annulation de votre réservation masterclass',
        text: `Votre demande d'annulation pour la masterclass "${selected.masterclasses.titre}" a été validée. Motif : ${motif}`
      })
    });
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selected.user_id,
        title: 'Annulation validée',
        body: `Votre demande d'annulation pour la masterclass "${selected.masterclasses.titre}" a été validée.`
      })
    });
    setOpen(false);
    setMotif('');
    setSelected(null);
    toast.success('Annulation validée et notification envoyée');
    fetchReservations();
    setLoading(false);
  };

  const handleRefuse = async (res) => {
    setLoading(true);
    await supabase.from('reservations_masterclass').update({ annulation_demandee: false, annulation_motif: null }).eq('id', res.id);
    // Notification à l'utilisateur
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: res.user.email,
        subject: 'Refus d\'annulation de votre réservation masterclass',
        text: `Votre demande d'annulation pour la masterclass "${res.masterclasses.titre}" a été refusée.`
      })
    });
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: res.user_id,
        title: 'Annulation refusée',
        body: `Votre demande d'annulation pour la masterclass "${res.masterclasses.titre}" a été refusée.`
      })
    });
    toast.success('Refus enregistré et notification envoyée');
    fetchReservations();
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Demandes d'annulation de masterclass
        </Typography>
        {loading ? <CircularProgress /> : (
          <List>
            {reservations.length === 0 && (
              <Typography>Aucune demande d'annulation en attente.</Typography>
            )}
            {reservations.map((res) => (
              <ListItem key={res.id} alignItems="flex-start" divider>
                <ListItemText
                  primary={<>
                    <b>{res.masterclasses?.titre}</b> — {res.user?.prenom} {res.user?.nom} ({res.user?.email})
                  </>}
                  secondary={<>
                    <Typography variant="body2">Date : {new Date(res.masterclasses?.date_heure).toLocaleString('fr-FR')}</Typography>
                    {res.annulation_motif && <Typography variant="body2" color="text.secondary">Motif : {res.annulation_motif}</Typography>}
                  </>}
                />
                <Chip label="En attente" color="warning" sx={{ mr: 2 }} />
                <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleValidate(res)}>
                  Valider l'annulation
                </Button>
                <Button variant="outlined" color="error" onClick={() => handleRefuse(res)}>
                  Refuser
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Valider l'annulation</DialogTitle>
        <DialogContent>
          <Typography>Motif d'annulation (optionnel) :</Typography>
          <TextField value={motif} onChange={e => setMotif(e.target.value)} fullWidth sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={confirmValidate}>Valider</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 