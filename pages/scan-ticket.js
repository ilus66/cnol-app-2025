import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Typography, Paper, Button, CircularProgress, Alert, useTheme, useMediaQuery } from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'

// On charge le QRCodeScanner de façon dynamique, en désactivant le rendu côté serveur (ssr: false)
const QRCodeScanner = dynamic(() => import('../components/QRCodeScanner'), {
  ssr: false,
  loading: () => <CircularProgress />,
})

export default function ScanTicketPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorScan, setErrorScan] = useState('')

  const handleScanSuccess = async (decodedText) => {
    setScanning(false)
    setLoading(true)
    setLastResult(null)
    setErrorScan('')

    try {
      const res = await fetch('/api/scan-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: decodedText }),
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.message || 'Erreur lors du scan du ticket')
      }

      setLastResult(result)
      toast.success(`Ticket validé : ${result.participant_name}`)

    } catch (err) {
      setErrorScan(err.message)
      toast.error(err.message)
    }
    setLoading(false)
  }

  const handleScanError = (errorMessage) => {
    if (!errorMessage.toLowerCase().includes('not found')) {
      console.warn(`QR Code scan error: ${errorMessage}`)
    }
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3, 
      maxWidth: isMobile ? '100%' : 600, 
      mx: 'auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <Toaster position="top-center" />
      
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          fontWeight: 'bold',
          mb: isMobile ? 2 : 3
        }}
      >
        Scanner un Ticket
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{
          mb: isMobile ? 3 : 2,
          textAlign: 'center',
          fontSize: isMobile ? '1rem' : 'inherit'
        }}
      >
        Scannez le QR code du ticket pour valider l'entrée du participant.
      </Typography>
      
      {loading && (
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <CircularProgress size={isMobile ? 40 : 60} />
          <Typography sx={{ mt: 2 }}>Validation en cours...</Typography>
        </Box>
      )}
      
      {!scanning && !loading && (
        <Button 
          variant="contained" 
          size={isMobile ? "large" : "large"}
          onClick={() => setScanning(true)}
          sx={{
            py: isMobile ? 3 : 2,
            px: isMobile ? 4 : 3,
            fontSize: isMobile ? '1.2rem' : 'inherit',
            borderRadius: isMobile ? 3 : 2,
            mb: 3
          }}
          fullWidth
        >
          Lancer le scanner
        </Button>
      )}
      
      {scanning && (
        <Box sx={{ mt: 2 }}>
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
          <Button 
            sx={{ 
              mt: 3, 
              py: isMobile ? 2 : 1.5,
              fontSize: isMobile ? '1.1rem' : 'inherit'
            }} 
            fullWidth 
            variant="outlined" 
            color="error" 
            onClick={() => setScanning(false)}
          >
            Arrêter le scanner
          </Button>
        </Box>
      )}
      
      {lastResult && (
        <Paper sx={{ 
          mt: 3, 
          p: isMobile ? 3 : 2,
          borderRadius: isMobile ? 3 : 2
        }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant={isMobile ? "h6" : "h6"}>
              Ticket validé avec succès :
            </Typography>
            <Typography sx={{ fontSize: isMobile ? '1.1rem' : 'inherit', mt: 1 }}>
              {lastResult.participant_name}
            </Typography>
            <Typography sx={{ fontSize: isMobile ? '1rem' : 'inherit' }}>
              Type : {lastResult.ticket_type}
            </Typography>
            <Typography sx={{ fontSize: isMobile ? '1rem' : 'inherit' }}>
              Statut : {lastResult.status}
            </Typography>
          </Alert>
          <Button 
            sx={{ 
              mt: 2,
              py: isMobile ? 2 : 1.5,
              fontSize: isMobile ? '1.1rem' : 'inherit'
            }} 
            fullWidth 
            variant="outlined" 
            onClick={() => setScanning(true)}
          >
            Scanner un autre ticket
          </Button>
        </Paper>
      )}

      {errorScan && (
        <Paper sx={{ 
          mt: 3, 
          p: isMobile ? 3 : 2,
          borderRadius: isMobile ? 3 : 2
        }}>
           <Alert severity="error" sx={{ mb: 2 }}>
            {errorScan}
          </Alert>
          <Button 
            sx={{ 
              mt: 2,
              py: isMobile ? 2 : 1.5,
              fontSize: isMobile ? '1.1rem' : 'inherit'
            }} 
            fullWidth 
            variant="outlined" 
            onClick={() => setScanning(true)}
          >
            Réessayer
          </Button>
        </Paper>
      )}
    </Box>
  )
} 