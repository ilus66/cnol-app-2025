import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button, TextField, Box, Typography, Avatar, CircularProgress } from '@mui/material';

export default function MonStand() {
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [slogan, setSlogan] = useState('');
  const [site, setSite] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // TODO: remplacer par l'id exposant réel (auth ou badge)
  const exposantId = 123;

  useEffect(() => {
    // Charger les infos existantes
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('exposants').select('*').eq('id', exposantId).single();
      if (data) {
        setLogoUrl(data.logo_url || '');
        setSlogan(data.slogan || '');
        setSite(data.site || '');
        setMessage(data.message_accueil || '');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogoChange = (e) => setLogoFile(e.target.files[0]);

  const handleUpload = async () => {
    setSaving(true);
    setError('');
    let uploadedLogoUrl = logoUrl;
    if (logoFile) {
      const { data, error } = await supabase.storage
        .from('logos-exposants')
        .upload(`stand-${exposantId}/${logoFile.name}`, logoFile, { upsert: true });
      if (!error) {
        uploadedLogoUrl = supabase.storage.from('logos-exposants').getPublicUrl(`stand-${exposantId}/${logoFile.name}`).data.publicUrl;
        setLogoUrl(uploadedLogoUrl);
      } else {
        setError("Erreur lors de l'upload du logo");
        setSaving(false);
        return;
      }
    }
    // Enregistre slogan, site, message, logoUrl dans la table exposants
    const { error: updateError } = await supabase.from('exposants').update({
      slogan, site, message_accueil: message, logo_url: uploadedLogoUrl
    }).eq('id', exposantId);
    if (updateError) setError("Erreur lors de la sauvegarde");
    else setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', my: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Personnalisation du stand</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={logoUrl} sx={{ width: 64, height: 64, mr: 2 }} />
        <Button variant="outlined" component="label">
          Changer le logo
          <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
        </Button>
      </Box>
      <TextField label="Slogan" value={slogan} onChange={e => setSlogan(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Site web" value={site} onChange={e => setSite(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Message d'accueil (affiché lors du scan)" value={message} onChange={e => setMessage(e.target.value)} fullWidth multiline rows={2} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleUpload} disabled={saving} fullWidth>
        {saving ? 'Envoi...' : 'Enregistrer'}
      </Button>
      {success && <Typography color="success.main" sx={{ mt: 2 }}>Stand mis à jour !</Typography>}
      {error && <Typography color="error.main" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
} 