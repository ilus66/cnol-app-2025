import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';

export default function CnolOpticienPage() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    email2: '',
    telephone: '',
    ville: '',
    nom_magasin: '',
    motivation: '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (form.email !== form.email2) {
      setError('Les emails ne correspondent pas.');
      return;
    }
    setLoading(true);
    const { email2, ...toSend } = form;
    const { error } = await supabase.from('cnol_opticien_annee').insert([toSend]);
    if (error) {
      setError("Erreur lors de l'envoi : " + error.message);
    } else {
      setMsg('Candidature envoyée avec succès !');
      setForm({ nom: '', prenom: '', email: '', email2: '', telephone: '', ville: '', nom_magasin: '', motivation: '' });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to right, #0d47a1, #1976d2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ maxWidth: 420, width: '100%', bgcolor: '#fff', borderRadius: 3, boxShadow: 3, p: 3, color: '#222' }}>
        <Typography variant="h5" fontWeight={700} align="center" mb={3}>Formulaire Opticien de l'année</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Nom *" name="nom" value={form.nom} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Prénom *" name="prenom" value={form.prenom} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Email *" name="email" value={form.email} onChange={handleChange} fullWidth required type="email" sx={{ mb: 2 }} />
          <TextField label="Confirmez votre e-mail *" name="email2" value={form.email2} onChange={handleChange} fullWidth required type="email" sx={{ mb: 2 }} error={!!form.email2 && form.email !== form.email2} helperText={form.email2 && form.email !== form.email2 ? 'Les emails ne correspondent pas.' : ''} />
          <TextField label="Téléphone *" name="telephone" value={form.telephone} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Nom du magasin *" name="nom_magasin" value={form.nom_magasin} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Ville *" name="ville" value={form.ville} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Motivation *" name="motivation" value={form.motivation} onChange={handleChange} fullWidth required multiline minRows={3} sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 1.5 }} disabled={loading}>
            {loading ? 'Envoi...' : "Envoyer la candidature"}
          </Button>
        </form>
        {msg && <Alert severity="success" sx={{ mt: 2 }}>{msg}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Box>
  );
} 