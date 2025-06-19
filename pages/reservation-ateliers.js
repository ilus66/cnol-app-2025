import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, TextField
} from '@mui/material'
import toast from 'react-hot-toast'

export default function ReservationAteliers() {
  const [ateliers, setAteliers] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [placesExternes, setPlacesExternes] = useState({})
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', atelier_id: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [settings, setSettings] = useState({ ouverture_reservation_atelier: false })
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    fetchData()
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single()
      if (data) setSettings(data)
      setLoadingSettings(false)
    }
    fetchSettings()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: all, error } = await supabase.from('ateliers').select('*').order('date_heure')
    // Récupérer le nombre de réservations externes pour chaque atelier
    const places = {}
    for (const a of all || []) {
      const { count } = await supabase
        .from('reservations_ateliers')
        .select('*', { count: 'exact', head: true })
        .eq('atelier_id', a.id)
        .eq('type', 'externe')
      places[a.id] = count
    }
    setPlacesExternes(places)
    setAteliers(all || [])
    setLoading(false)
  }

  const reserver = async (atelier) => {
    setForm(f => ({ ...f, atelier_id: atelier.id }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    const { nom, prenom, email, telephone, atelier_id } = form
    if (!nom || !prenom || !email || !telephone || !atelier_id) {
      toast.error('Tous les champs sont obligatoires')
      setSubmitLoading(false)
      return
    }
    const res = await fetch('/api/reservation-atelier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, email, telephone, atelier_id, type: 'externe' })
    })
    setSubmitLoading(false)
    if (res.ok) {
      const data = await res.json()
      toast.success(data.message || 'Réservation confirmée !')
      setForm({ nom: '', prenom: '', email: '', telephone: '', atelier_id: '' })
    } else {
      let errorMsg = 'Erreur lors de la réservation'
      try {
        const data = await res.json()
        if (data && data.message) errorMsg = data.message
      } catch (e) {}
      toast.error(errorMsg)
    }
  }

  if (loadingSettings) return <CircularProgress />
  if (!settings.ouverture_reservation_atelier) return <Box sx={{ p: 4 }}><Typography variant="h5">Les réservations d'ateliers ne sont pas encore ouvertes.</Typography></Box>

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
              variant="contained"
              color="primary"
              disabled={placesExternes[a.id] >= 30}
              onClick={() => reserver(a)}
            >
              {placesExternes[a.id] >= 30 ? 'Complet' : 'Réserver'}
            </Button>
          </ListItem>
        ))}
      </List>
      {form.atelier_id && (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2, maxWidth: 400 }}>
          <Typography variant="h6">Réservation pour l'atelier sélectionné</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Nom" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} fullWidth sx={{ mb: 2 }} />
            <TextField label="Prénom" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} fullWidth sx={{ mb: 2 }} />
            <TextField label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth sx={{ mb: 2 }} />
            <TextField label="Téléphone" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} fullWidth sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" color="success" disabled={submitLoading} fullWidth>
              {submitLoading ? 'Réservation…' : 'Valider la réservation'}
            </Button>
          </form>
        </Box>
      )}
    </Box>
  )
}
