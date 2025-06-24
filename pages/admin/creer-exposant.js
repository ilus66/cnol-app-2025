import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';

export default function CreerExposant() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const { error } = await supabase.from('exposants').insert({
      nom,
      email_responsable: email,
      description
    });
    if (error) setError("Erreur lors de la création de l'exposant");
    else setSuccess(true);
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Créer un exposant</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Nom de l'exposant" value={nom} onChange={e => setNom(e.target.value)} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Email du responsable" value={email} onChange={e => setEmail(e.target.value)} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </form>
        {success && <Alert severity="success" sx={{ mt: 2 }}>Exposant créé avec succès !</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
} 