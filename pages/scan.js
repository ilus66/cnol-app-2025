import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    )

    scanner.render(
      async (decodedText) => {
        setScanning(false)
        scanner.clear()
        handleScan(decodedText)
      },
      (error) => {
        // ignorer les erreurs de scan
      }
    )

    return () => scanner.clear().catch(() => {})
  }, [scanning])

  const handleScan = async (decodedText) => {
    setLoading(true);
    setLastResult(null);
    try {
      let id = null;

      // Logique pour extraire l'ID du QR code (inchangée)
      if (decodedText.startsWith('cnol2025-')) {
        const extractedId = decodedText.split('-')[1];
        if (/^\d+$/.test(extractedId)) {
          id = parseInt(extractedId, 10);
        }
      }
      if (!id && /^\d+$/.test(decodedText)) {
        id = parseInt(decodedText, 10);
      }
      if (!id && decodedText.includes('id=')) {
        const url = new URL(decodedText);
        const paramId = url.searchParams.get('id');
        if (paramId && /^\d+$/.test(paramId)) {
          id = parseInt(paramId, 10);
        }
      }

      if (!id) {
        throw new Error("Format du QR code non valide.");
      }

      const playSound = (type) => {
        let audio
        switch (type) {
          case 'success':
            audio = new Audio('/success.mp3')
            break
          case 'error':
            audio = new Audio('/error.mp3')
            break
          case 'warning':
            audio = new Audio('/warning.mp3')
            break
          default:
            return
        }
        audio.play().catch(() => {}) // ignore erreur silencieuse
      }


      // --- MODIFICATION PRINCIPALE ICI ---
      // Ancien code : supabase.from('inscription').update(...)
      // Nouveau code : On insère dans la table 'entrees'

      const { data, error } = await supabase
        .from('entrees')
        .insert({ user_id: id }) // 1. On insère une nouvelle entrée liée à l'ID de l'inscrit
        .select('*, inscription(*)')    // 2. On récupère les détails de l'entrée ET de l'inscrit associé
        .single();

      if (error) throw error;

      // 3. On adapte l'objet pour l'affichage du dernier scan
      const scanResult = {
        ...data.inscription, // Copie les infos de l'inscrit (nom, prénom, etc.)
        scanned_at: data.scanned_at     
        // Ajoute l'heure du scan
      };

      setLastResult(scanResult);
      toast.success(`Entrée enregistrée pour ${scanResult.prenom} ${scanResult.nom}`);

    } catch (err) {
      toast.error(err.message || 'Erreur lors du scan');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toaster />
      <Typography variant="h5" gutterBottom>Scan des badges</Typography>
      {loading && <CircularProgress />}
      {!scanning && !loading && (
        <Button variant="contained" onClick={() => setScanning(true)}>
          Lancer le scanner
        </Button>
      )}
      <div id="reader" style={{ marginTop: 20 }} />
      {lastResult && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6">Dernier badge scanné :</Typography>
          <Typography>{lastResult.prenom} {lastResult.nom}</Typography>
          <Typography>Type : {lastResult.participant_type}</Typography>
          <Typography>Fonction : {lastResult.fonction}</Typography>
          <Typography>Ville : {lastResult.ville}</Typography>
        </Paper>
      )}
    </Box>
  )
}
