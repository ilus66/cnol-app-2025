import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  Box, Typography, Button, CircularProgress, List, ListItem, ListItemText
} from '@mui/material'
import toast from 'react-hot-toast'

export default function ReservationAteliers() {
  const [userId, setUserId] = useState(null)
  const [ateliers, setAteliers] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id
      if (uid) setUserId(uid)
    })
  }, [])

  useEffect(() => {
    if (userId) fetchData()
  }, [userId])

  const fetchData = async () => {
    setLoading(true)
    const { data: all, error } = await supabase.from('ateliers').select('*').order('date_heure')
    const { data: booked } = await supabase
      .from('reservations_atelier')
      .select('atelier_id')
      .eq('user_id', userId)

    setAteliers(all || [])
    setReservations(booked?.map(r => r.atelier_id) || [])
    setLoading(false)
  }

  const reserver = async (atelier) => {
    if (reservations.includes(atelier.id)) return

    const { count } = await supabase
      .from('reservations_atelier')
      .select('*', { count: 'exact', head: true })
      .eq('atelier_id', atelier.id)

    if (count >= atelier.places) {
      toast.error("Complet")
      return
    }

    const { error } = await supabase.from('reservations_atelier').insert({
      user_id: userId,
      atelier_id: atelier.id
    })

    if (!error) {
      toast.success("Réservé")
      fetchData()
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Réserver un atelier</Typography>
      <List>
        {ateliers.map((a) => (
          <ListItem key={a.id} divider>
            <ListItemText
              primary={`${a.titre} — ${a.intervenant}`}
              secondary={`${new Date(a.date_heure).toLocaleString()} — Salle ${a.salle}`}
            />
            <Button
              variant={reservations.includes(a.id) ? 'outlined' : 'contained'}
              color={reservations.includes(a.id) ? 'success' : 'primary'}
              disabled={reservations.includes(a.id)}
              onClick={() => reserver(a)}
            >
              {reservations.includes(a.id) ? 'Réservé' : 'Réserver'}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
