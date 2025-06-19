import { useState } from 'react'
import { useRouter } from 'next/router'
import { Box, TextField, Button, Typography, Alert } from '@mui/material'
import { supabase } from '../lib/supabaseClient'

export default function IdentificationPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Vérifier le code dans la table inscription
    const { data, error: err } = await supabase
      .from('inscription')
      .select('*')
      .eq('identifiant_badge', code.trim().toUpperCase())
      .single()
    setLoading(false)
    if (err || !data) {
      setError("Numéro d'identification invalide. Veuillez vérifier votre badge ou vous inscrire.")
      return
    }
    // Rediriger vers la réservation atelier/masterclass (à adapter selon le contexte)
    router.push({ pathname: '/reservation-ateliers', query: { badge: code.trim().toUpperCase() } })
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, border: '1px solid #ddd', borderRadius: 2, background: '#fff' }}>
      <Typography variant="h5" gutterBottom>Identification badge</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Pour réserver un atelier ou une masterclass, veuillez saisir le numéro d'identification figurant sur votre badge.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Numéro d'identification badge"
          value={code}
          onChange={e => setCode(e.target.value)}
          fullWidth
          required
          inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' } }}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Vérification...' : 'Accéder à la réservation'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
      <Typography variant="body2" sx={{ mt: 3 }}>
        <b>Vous n'avez pas encore de badge ?</b> <a href="/inscription">Inscrivez-vous ici</a>
      </Typography>
    </Box>
  )
} 