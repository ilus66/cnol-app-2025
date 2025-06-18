import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  Box, Typography, Button, Card, CardContent, CircularProgress
} from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'

export default function ReservationMasterclassPage() {
  const [masterclass, setMasterclass] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser()
    fetchMasterclass()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchMasterclass = async () => {
    const { data } = await supabase.from('masterclass').select('*').order('date_heure')
    setMasterclass(data || [])
  }

  const handleReservation = async (id) => {
    if (!user) return toast.error('Utilisateur non identifié')
    setLoading(true)
    const { error } = await supabase.from('reservations_masterclass').insert({
      user_id: user.id, masterclass_id: id
    })
    setLoading(false)
    if (error) {
      toast.error('Déjà réservé ou erreur')
    } else {
      toast.success('Réservation confirmée')
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Toaster />
      <Typography variant="h4" gutterBottom>Réservation des Masterclass</Typography>
      {loading && <CircularProgress />}
      {masterclass.length === 0 && (
        <Typography>Aucune masterclass disponible pour le moment.</Typography>
      )}
      <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
        {masterclass.map((m) => (
          <Card key={m.id}>
            <CardContent>
              <Typography variant="h6">{m.titre}</Typography>
              <Typography>{m.intervenant}</Typography>
              <Typography>{new Date(m.date_heure).toLocaleString()}</Typography>
              <Typography>Salle : {m.salle}</Typography>
              <Typography>Places : {m.places}</Typography>
              <Button sx={{ mt: 1 }} variant="contained" onClick={() => handleReservation(m.id)}>
                Réserver
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
