import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { useRouter } from 'next/router';

export default function EnvoyerNotification() {
  const router = useRouter();
  const { exposant_id } = router.query;
  const [exposant, setExposant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [destinataires, setDestinataires] = useState('tous'); // 'tous' ou 'contacts'
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [quotaRestant, setQuotaRestant] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!exposant_id) return;
    const fetchData = async () => {
      setLoading(true);
      // Charger les infos de l'exposant
      const { data: exp } = await supabase.from('exposants').select('*').eq('id', exposant_id).single();
      setExposant(exp);
      
      // Calculer le quota restant
      const today = new Date().toISOString().slice(0, 10);
      if (exp.quota_push_date !== today) {
        setQuotaRestant(exp.quota_push_journalier || 0);
      } else {
        setQuotaRestant((exp.quota_push_journalier || 0) - (exp.quota_push_utilise || 0));
      }
      
      // Charger les contacts scannés
      const { data: contactsList } = await supabase
        .from('leads')
        .select(`
          visiteur:inscription(id, prenom, nom, email)
        `)
        .eq('exposant_id', exposant_id);
      setContacts(contactsList?.map(c => c.visiteur).filter(Boolean) || []);
      
      setLoading(false);
    };
    fetchData();
  }, [exposant_id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (quotaRestant <= 0) {
      setError('Quota de notifications atteint pour aujourd\'hui');
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError('Titre et contenu requis');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      let destinatairesList = [];
      if (destinataires === 'tous') {
        // Récupérer tous les utilisateurs avec abonnement push
        const { data: users } = await supabase
          .from('push_subscriptions')
          .select('user_id')
          .not('user_id', 'is', null);
        destinatairesList = users?.map(u => u.user_id) || [];
      } else {
        // Utiliser les contacts sélectionnés
        destinatairesList = selectedContacts;
      }

      // Envoyer les notifications
      let sentCount = 0;
      for (const userId of destinatairesList) {
        const res = await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            title,
            body,
            exposant_id: parseInt(exposant_id)
          })
        });
        if (res.ok) sentCount++;
      }

      // Mettre à jour le quota
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from('exposants').update({
        quota_push_utilise: (exposant.quota_push_utilise || 0) + 1,
        quota_push_date: today
      }).eq('id', exposant_id);

      setSuccess(`Notification envoyée à ${sentCount} destinataires`);
      setTitle('');
      setBody('');
      setQuotaRestant(quotaRestant - 1);
    } catch (err) {
      setError('Erreur lors de l\'envoi');
    }
    setSending(false);
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!exposant) return <Alert severity="error">Exposant introuvable</Alert>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Envoyer une notification - {exposant.nom}
        </Typography>
        
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2">
            Quota restant aujourd'hui : <strong>{quotaRestant}</strong> notification(s)
          </Typography>
        </Box>

        <form onSubmit={handleSend}>
          <TextField
            label="Titre de la notification"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Contenu de la notification"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Destinataires</InputLabel>
            <Select
              value={destinataires}
              onChange={(e) => setDestinataires(e.target.value)}
            >
              <MenuItem value="tous">Tous les participants</MenuItem>
              <MenuItem value="contacts">Mes contacts scannés</MenuItem>
            </Select>
          </FormControl>

          {destinataires === 'contacts' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Sélectionner les contacts ({contacts.length} disponibles) :
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {contacts.map((contact) => (
                  <Chip
                    key={contact.id}
                    label={`${contact.prenom} ${contact.nom}`}
                    onClick={() => {
                      if (selectedContacts.includes(contact.id)) {
                        setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                      } else {
                        setSelectedContacts([...selectedContacts, contact.id]);
                      }
                    }}
                    color={selectedContacts.includes(contact.id) ? 'primary' : 'default'}
                    variant={selectedContacts.includes(contact.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={sending || quotaRestant <= 0}
          >
            {sending ? 'Envoi...' : `Envoyer (${quotaRestant} restant)`}
          </Button>
        </form>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Paper>
    </Box>
  );
} 