import { useState } from 'react';
import { Box, Paper, Typography, TextField, Stack, Divider } from '@mui/material';
import QRCode from 'qrcode.react';
import dynamic from 'next/dynamic';
const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

const logoUrl = '/logo-cnol.png';

export default function TestBadge() {
  const [nom, setNom] = useState('DUPONT');
  const [prenom, setPrenom] = useState('JEAN');
  const [fonction, setFonction] = useState('Opticien');
  const [ville, setVille] = useState('Casablanca');
  const [badgeCode, setBadgeCode] = useState('123ABC');
  const [date, setDate] = useState('11 OCT. 2024');
  const [heure, setHeure] = useState('09H00');
  const [dateFin, setDateFin] = useState('12 OCT. 2024');
  const [heureFin, setHeureFin] = useState('20H00');
  const [lieu, setLieu] = useState('Centre de conférences Fm6education - Av. Allal Al Fassi RABAT');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f5f6fa 0%, #e3e6ee 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, letterSpacing: 1 }}>Prévisualisation badge (test)</Typography>
      <Stack direction="row" spacing={4} alignItems="flex-start">
        <Paper elevation={8} sx={{
          p: 0,
          borderRadius: 6,
          minWidth: 420,
          minHeight: 600,
          bgcolor: '#fff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px #0002',
          mx: 'auto',
          overflow: 'hidden',
        }}>
          {/* Code-barres en haut à gauche */}
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', pt: 3, pb: 0, pl: 4.5 }}>
            <Box sx={{ mr: 2.5, mt: 1 }}>
              <Barcode value={badgeCode} width={2} height={24} displayValue={false} margin={0} style={{ width: 95 }} />
            </Box>
            <Box sx={{ flex: 1 }} />
          </Box>
          {/* Titre principal sur deux lignes et adresse */}
          <Box sx={{ px: 4, textAlign: 'left', mb: 2, mt: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, fontSize: 28, letterSpacing: 0, fontFamily: 'Montserrat, Roboto, Arial', mb: 0.2, lineHeight: 1.1 }}>
              CONGRÈS NATIONAL<br/>D'OPTIQUE LUNETTERIE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Montserrat, Roboto, Arial', fontWeight: 500, fontSize: 15, lineHeight: 1.2 }}>
              Centre de conférences Fm6education<br/>Av. Allal Al Fassi RABAT
            </Typography>
          </Box>
          {/* Bloc dates/horaires descendu et flèche centrée */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', px: 4, mb: 2, mt: 2 }}>
            <Box sx={{ textAlign: 'left', minWidth: 120 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 19 }}>{date}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 15 }}>{heure}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%', mx: 3, mt: 0, mb: 1 }}>
              <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 300, fontSize: 28, lineHeight: 1 }}>&#8594;</Typography>
            </Box>
            <Box sx={{ textAlign: 'left', minWidth: 120, ml: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 19 }}>{dateFin}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 15 }}>{heureFin}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          {/* Bloc central : nom/prénom, fonction en gras dessous, ville/code */}
          <Box sx={{ px: 4, mb: 1, mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.5 }}>{prenom} {nom}</Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 800, fontSize: 15 }}>{fonction}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: 15 }}>{ville}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: 15 }}>Code : <b>{badgeCode}</b></Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          {/* Bas du badge : texte badge nominatif sous la dernière ligne, URL, QR code en bas à droite */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', minHeight: 100, px: 4, pb: 2 }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: 10, mb: 0.5 }}>
                BADGE nominatif personnel – Présentez-le à l'entrée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
                www.app.cnol.ma
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', right: 24, bottom: 16 }}>
              <QRCode value={badgeCode} size={80} />
            </Box>
          </Box>
        </Paper>
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Données badge</Typography>
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