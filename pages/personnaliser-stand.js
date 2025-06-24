import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, TextField, Button, Avatar, Alert, CircularProgress, Grid, IconButton } from '@mui/material';
import { Facebook, LinkedIn, Instagram, Language } from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function PersonnaliserStand() {
  const router = useRouter();
  const { exposant_id } = router.query;
  const [exposant, setExposant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [form, setForm] = useState({
    slogan: '',
    description: '',
    site: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    message_accueil: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!exposant_id) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: exp } = await supabase.from('exposants').select('*').eq('id', exposant_id).single();
      if (exp) {
        setExposant(exp);
        setForm({
          slogan: exp.slogan || '',
          description: exp.description || '',
          site: exp.site || '',
          facebook: exp.facebook || '',
          linkedin: exp.linkedin || '',
          instagram: exp.instagram || '',
          message_accueil: exp.message_accueil || ''
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [exposant_id]);

  const handleLogoChange = (e) => setLogoFile(e.target.files[0]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let logoUrl = exposant.logo_url;
      
      // Upload du logo si nouveau fichier
      if (logoFile) {
        const { data, error: uploadError } = await supabase.storage
          .from('logos-exposants')
          .upload(`stand-${exposant_id}/${logoFile.name}`, logoFile, { upsert: true });
        
        if (uploadError) throw new Error("Erreur lors de l'upload du logo");
        
        logoUrl = supabase.storage.from('logos-exposants').getPublicUrl(`stand-${exposant_id}/${logoFile.name}`).data.publicUrl;
      }

      // Sauvegarder les données
      const { error: updateError } = await supabase
        .from('exposants')
        .update({
          ...form,
          logo_url: logoUrl
        })
        .eq('id', exposant_id);

      if (updateError) throw new Error("Erreur lors de la sauvegarde");

      setSuccess('Stand mis à jour avec succès !');
      setExposant({ ...exposant, ...form, logo_url: logoUrl });
      setLogoFile(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!exposant) return <Alert severity="error">Exposant introuvable</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Personnaliser mon stand - {exposant.nom}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSave}>
          {/* Logo */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Logo du stand</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar 
                src={exposant.logo_url} 
                sx={{ width: 80, height: 80 }}
                variant="rounded"
              />
              <Button variant="outlined" component="label">
                Changer le logo
                <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Format recommandé : PNG ou JPG, max 2MB
            </Typography>
          </Box>

          {/* Informations principales */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                label="Slogan"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                fullWidth
                placeholder="Votre slogan ou accroche"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description du stand"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Présentez votre stand, vos produits, vos services..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message d'accueil (affiché lors du scan)"
                value={form.message_accueil}
                onChange={(e) => setForm({ ...form, message_accueil: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder="Message de bienvenue personnalisé..."
              />
            </Grid>
          </Grid>

          {/* Liens et réseaux sociaux */}
          <Typography variant="h6" gutterBottom>Liens et réseaux sociaux</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Site web"
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
                fullWidth
                placeholder="https://www.votresite.com"
                InputProps={{
                  startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Facebook"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                fullWidth
                placeholder="https://facebook.com/votrepage"
                InputProps={{
                  startAdornment: <Facebook sx={{ mr: 1, color: '#1877F2' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="LinkedIn"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                fullWidth
                placeholder="https://linkedin.com/company/votreentreprise"
                InputProps={{
                  startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077B5' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                fullWidth
                placeholder="https://instagram.com/votrecompte"
                InputProps={{
                  startAdornment: <Instagram sx={{ mr: 1, color: '#E4405F' }} />
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder la personnalisation'}
          </Button>
        </form>

        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
} 