import { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, TextField, Button, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-hot-toast';

const faqData = [
  {
    question: "Comment m'inscrire à l'événement ?",
    answer: "Cliquez sur 'S'inscrire' sur la page d'accueil, remplissez le formulaire et validez. Vous recevrez un email de confirmation."
  },
  {
    question: "Quand et comment recevrai-je mon badge ?",
    answer: "Votre badge nominatif (PDF) sera disponible dans 'Mon espace' une fois votre inscription validée par l'administrateur. Vous recevrez également un email avec le badge en pièce jointe."
  },
  {
    question: "Comment activer les notifications push ?",
    answer: "Dans 'Mon espace', activez les notifications via la cloche ou le bouton dédié. Autorisez les notifications si votre navigateur le demande."
  },
  {
    question: "Comment réserver un atelier ou une masterclass ?",
    answer: "Depuis 'Mon espace', cliquez sur 'Réserver un atelier' ou 'Réserver une masterclass', puis suivez les instructions."
  },
  {
    question: "Comment scanner un contact ?",
    answer: "Cliquez sur 'Scanner un contact' dans 'Mon espace' et scannez le QR code du badge d'un autre participant."
  },
  {
    question: "Que faire en cas de problème ou de question ?",
    answer: "Utilisez le formulaire de contact ci-dessous pour nous écrire, ou contactez-nous à l'adresse indiquée dans l'application."
  }
];

export default function FAQ() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'contact@cnol.ma',
        subject: 'Contact via FAQ',
        text: `Nom: ${form.nom}\nEmail: ${form.email}\nMessage: ${form.message}`
      })
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Message envoyé ! Nous vous répondrons rapidement.');
      setForm({ nom: '', email: '', message: '' });
    } else {
      toast.error('Erreur lors de l\'envoi du message.');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', my: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        FAQ & Aide
      </Typography>
      {faqData.map((item, idx) => (
        <Accordion key={idx} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Nous contacter
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Nom" name="nom" value={form.nom} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth sx={{ mb: 2 }} required type="email" />
          <TextField label="Message" name="message" value={form.message} onChange={handleChange} fullWidth sx={{ mb: 2 }} required multiline rows={4} />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Envoyer
          </Button>
        </form>
      </Paper>
    </Box>
  );
} 