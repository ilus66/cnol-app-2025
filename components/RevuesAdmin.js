import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, TextField, Button, Paper, Typography, Stack, Alert, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

export default function RevuesAdmin() {
  const [revues, setRevues] = useState([]);
  const [form, setForm] = useState({ titre: '', pdf: '', couverture: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchRevues = async () => {
    const { data, error } = await supabase.from('revues').select('*').order('created_at', { ascending: false });
    if (!error) setRevues(data || []);
  };

  useEffect(() => { fetchRevues(); }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    const fileExt = file.name.split('.').pop();
    const fileName = `couverture-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('revues-couvertures').upload(fileName, file);
    if (error) {
      setError('Erreur upload image : ' + error.message); setUploading(false); return;
    }
    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage.from('revues-couvertures').getPublicUrl(fileName);
    setForm(f => ({ ...f, couverture: publicUrlData.publicUrl }));
    setUploading(false);
  };

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
          <Button variant="outlined" component="label" disabled={uploading}>
            {uploading ? 'Upload en cours...' : (form.couverture ? 'Changer la couverture' : 'Uploader une couverture')}
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Button>
          {form.couverture && <img src={form.couverture} alt="aperçu couverture" style={{ maxWidth: 120, maxHeight: 160, borderRadius: 4, marginTop: 4 }} />}
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