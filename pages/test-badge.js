import { useState } from 'react';
import { Box, Paper, Typography, TextField, Stack, Divider } from '@mui/material';
import QRCode from 'qrcode.react';

const logoUrl = '/logo-cnol.png';

export default function TestBadge() {
  const [nom, setNom] = useState('DUPONT');
  const [prenom, setPrenom] = useState('JEAN');
  const [fonction, setFonction] = useState('Opticien');
  const [ville, setVille] = useState('Casablanca');
  const [badgeCode, setBadgeCode] = useState('123ABC');
  const [date, setDate] = useState('10 OCT 2025');
  const [heure, setHeure] = useState('10H00');
  const [dateFin, setDateFin] = useState('12 OCT 2025');
  const [heureFin, setHeureFin] = useState('19H00');
  const [lieu, setLieu] = useState('Fondation Mohammed VI, Rabat');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Prévisualisation badge (test)</Typography>
      <Stack direction="row" spacing={4} alignItems="flex-start">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, minWidth: 400, minHeight: 540, bgcolor: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px #0002' }}>
          {/* En-tête */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 1, fontFamily: 'Montserrat, Roboto, Arial' }}>
              CNOL 2025
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: 'Montserrat, Roboto, Arial' }}>
              {lieu}
            </Typography>
          </Box>
          {/* Bloc dates/horaires */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 1 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{date}</Typography>
              <Typography variant="body2" color="text.secondary">{heure}</Typography>
            </Box>
            <Typography variant="h4" color="text.secondary" sx={{ mx: 2, fontWeight: 300 }}>&#8594;</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{dateFin}</Typography>
              <Typography variant="body2" color="text.secondary">{heureFin}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Bloc identité : à gauche (nom, code), à droite (fonction, ville) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{prenom} {nom}</Typography>
              <Typography variant="body2" color="text.secondary">Code : <b>{badgeCode}</b></Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">{fonction}</Typography>
              <Typography variant="body2" color="text.secondary">{ville}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Bas du badge */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
              BADGE nominatif personnel – Présentez-le à l'entrée<br />
              <b>www.app.cnol.ma</b>
            </Typography>
            <Box sx={{ position: 'absolute', right: 0, bottom: 0 }}>
              <QRCode value={badgeCode} size={80} />
            </Box>
          </Box>
        </Paper>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Données badge</Typography>
          <Stack spacing={2}>
            <TextField label="Nom" value={nom} onChange={e => setNom(e.target.value.toUpperCase())} />
            <TextField label="Prénom" value={prenom} onChange={e => setPrenom(e.target.value.toUpperCase())} />
            <TextField label="Fonction" value={fonction} onChange={e => setFonction(e.target.value)} />
            <TextField label="Ville" value={ville} onChange={e => setVille(e.target.value)} />
            <TextField label="Code badge" value={badgeCode} onChange={e => setBadgeCode(e.target.value.toUpperCase())} />
            <TextField label="Date début" value={date} onChange={e => setDate(e.target.value)} />
            <TextField label="Heure début" value={heure} onChange={e => setHeure(e.target.value)} />
            <TextField label="Date fin" value={dateFin} onChange={e => setDateFin(e.target.value)} />
            <TextField label="Heure fin" value={heureFin} onChange={e => setHeureFin(e.target.value)} />
            <TextField label="Lieu" value={lieu} onChange={e => setLieu(e.target.value)} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
} 