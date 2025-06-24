import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Grow
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

export default function AdminProgramme() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [form, setForm] = useState({ jour: '', salle: '', heure: '', titre: '', intervenant: '' });
  const [published, setPublished] = useState(false);

  // TODO: remplacer par une vraie vérification admin
  // (ici, simple check localStorage pour démo)
  useEffect(() => {
    const isAdmin = localStorage.getItem('role') === 'admin';
    if (!isAdmin) window.location.href = '/admin-login';
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('programme_general')
      .select('*')
      .order('jour', { ascending: true })
      .order('salle', { ascending: true })
      .order('heure', { ascending: true });
    if (!error) {
      setSessions(data);
      // Si au moins une session, on prend le published du premier (global)
      if (data && data.length > 0) setPublished(!!data[0].published);
      else setPublished(false);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleOpen = (session = null) => {
    setEditSession(session);
    setForm(session || { jour: '', salle: '', heure: '', titre: '', intervenant: '' });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditSession(null); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (editSession) {
      // Update
      await supabase.from('programme_general').update(form).eq('id', editSession.id);
    } else {
      // Insert
      await supabase.from('programme_general').insert([form]);
    }
    handleClose();
    fetchSessions();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette session ?')) {
      await supabase.from('programme_general').delete().eq('id', id);
      fetchSessions();
    }
  };

  const handleTogglePublished = async () => {
    // Toggle published pour toutes les sessions (ou adapter si global)
    await supabase.from('programme_general').update({ published: !published });
    setPublished(!published);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Administration du programme général
        </Typography>
        <Button
          variant={published ? 'outlined' : 'contained'}
          color={published ? 'success' : 'warning'}
          onClick={handleTogglePublished}
          sx={{ mb: 2, ml: 2 }}
        >
          {published ? 'Cacher le programme' : 'Publier le programme'}
        </Button>
        <Typography variant="body2" color={published ? 'success.main' : 'warning.main'} sx={{ ml: 2, mb: 2 }}>
          Statut : {published ? 'Publié (visible pour tous)' : 'Caché (visible admin uniquement)'}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
          Ajouter une session
        </Button>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : (
          <List>
            {sessions.map((s) => (
              <ListItem key={s.id} alignItems="flex-start" divider>
                <ListItemText
                  primary={<><b>{s.jour}</b> | <b>{s.salle}</b> | <b>{s.heure}</b></>}
                  secondary={<>
                    <Typography variant="body1">{s.titre}</Typography>
                    {s.intervenant && <Typography variant="body2" color="text.secondary">{s.intervenant}</Typography>}
                  </>}
                />
                <IconButton onClick={() => handleOpen(s)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(s.id)} color="error"><Delete /></IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth TransitionComponent={Grow}>
        <DialogTitle>{editSession ? 'Éditer la session' : 'Ajouter une session'}</DialogTitle>
        <DialogContent>
          <TextField label="Jour" name="jour" value={form.jour} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Salle" name="salle" value={form.salle} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Heure" name="heure" value={form.heure} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Titre" name="titre" value={form.titre} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Intervenant" name="intervenant" value={form.intervenant} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 