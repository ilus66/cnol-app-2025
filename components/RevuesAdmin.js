import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, TextField, Button, Paper, Typography, Stack, Alert, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

export default function RevuesAdmin() {
  const [revues, setRevues] = useState([]);
  const [form, setForm] = useState({ titre: '', pdf: '', couverture: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRevues = async () => {
    const { data, error } = await supabase.from('revues').select('*').order('created_at', { ascending: false });
    if (!error) setRevues(data || []);
  };

  useEffect(() => { fetchRevues(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (!form.titre || !form.pdf || !form.couverture) {
      setError('Tous les champs sont obligatoires.'); setLoading(false); return;
    }
    const { error } = await supabase.from('revues').insert([{ ...form }]);
    if (error) setError(error.message);
    else {
      setSuccess('Revue ajoutée !');
      setForm({ titre: '', pdf: '', couverture: '' });
      fetchRevues();
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Ajouter une revue Maroc Optique</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField label="Titre" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} fullWidth />
          <TextField label="Lien PDF" value={form.pdf} onChange={e => setForm(f => ({ ...f, pdf: e.target.value }))} fullWidth />
          <TextField label="Lien image couverture" value={form.couverture} onChange={e => setForm(f => ({ ...f, couverture: e.target.value }))} fullWidth />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'Ajout...' : 'Ajouter'}</Button>
        </Stack>
      </Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Revues existantes</Typography>
      <List>
        {revues.map((revue, idx) => (
          <ListItem key={idx} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar variant="square" src={revue.couverture} alt={revue.titre} sx={{ width: 56, height: 80, mr: 2 }} />
            </ListItemAvatar>
            <ListItemText
              primary={<span style={{ fontWeight: 'bold' }}>{revue.titre}</span>}
              secondary={<a href={revue.pdf} target="_blank" rel="noopener noreferrer">Télécharger</a>}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 