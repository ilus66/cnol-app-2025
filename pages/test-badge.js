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
  const [date, setDate] = useState('12 octobre 2025');
  const [heure, setHeure] = useState('20H');
  const [lieu, setLieu] = useState('Fondation Mohammed VI, Rabat');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Prévisualisation badge (test)</Typography>
      <Stack direction="row" spacing={4} alignItems="flex-start">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, minWidth: 400, minHeight: 540, bgcolor: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px #0002' }}>
          {/* Logo en haut à gauche */}
          <Box sx={{ position: 'absolute', top: 18, left: 18 }}>
            <img src={logoUrl} alt="Logo CNOL" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          </Box>
          {/* Titre et sous-titre */}
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 1, mb: 0.5, fontFamily: 'Montserrat, Roboto, Arial', mt: 0.5, ml: 7 }}>
            CNOL 2025
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontFamily: 'Montserrat, Roboto, Arial', ml: 7 }}>
            {lieu}
          </Typography>
          {/* Date et heure (remplace le bloc fonction/ville) */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 7 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{date} {heure}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Nom/prénom + fonction/ville sur la même ligne */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{prenom} {nom}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>{fonction} – {ville}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Code badge : <b>{badgeCode}</b></Typography>
          <Divider sx={{ my: 2 }} />
          {/* Infos secondaires */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Badge nominatif personnel – Présentez-le à l'entrée<br />
            <b>www.app.cnol.ma</b>
          </Typography>
          {/* QR code en bas à droite */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', mt: 2 }}>
            <QRCode value={badgeCode} size={80} />
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
            <TextField label="Date" value={date} onChange={e => setDate(e.target.value)} />
            <TextField label="Heure" value={heure} onChange={e => setHeure(e.target.value)} />
            <TextField label="Lieu" value={lieu} onChange={e => setLieu(e.target.value)} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
} 