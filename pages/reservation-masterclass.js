import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  Box, Typography, Button, Card, CardContent, CircularProgress, TextField
} from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'

export default function ReservationMasterclassPage() {
  const [masterclass, setMasterclass] = useState([])
  const [placesExternes, setPlacesExternes] = useState({})
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', masterclass_id: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({ ouverture_reservation_masterclass: false })
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    fetchMasterclass()
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single()
      if (data) setSettings(data)
      setLoadingSettings(false)
    }
    fetchSettings()
  }, [])

  const fetchMasterclass = async () => {
    setLoading(true)
    const { data } = await supabase.from('masterclass').select('*').order('date_heure')
    const places = {}
    for (const m of data || []) {
      const { count } = await supabase
        .from('reservations_masterclass')
        .select('*', { count: 'exact', head: true })
        .eq('masterclass_id', m.id)
        .eq('type', 'externe')
      places[m.id] = count
    }
    setPlacesExternes(places)
    setMasterclass(data || [])
    setLoading(false)
  }

  const reserver = (mc) => {
    setForm(f => ({ ...f, masterclass_id: mc.id }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    const { nom, prenom, email, telephone, masterclass_id } = form
    if (!nom || !prenom || !email || !telephone || !masterclass_id) {
      toast.error('Tous les champs sont obligatoires')
      setSubmitLoading(false)
      return
    }
    const res = await fetch('/api/reservation-masterclass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, email, telephone, masterclass_id, type: 'externe' })
    })
    setSubmitLoading(false)
    if (res.ok) {
      toast.success('Réservation confirmée !')
      setForm({ nom: '', prenom: '', email: '', telephone: '', masterclass_id: '' })
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
  if (!settings.ouverture_reservation_masterclass) return <Box sx={{ p: 4 }}><Typography variant="h5">Les réservations de masterclass ne sont pas encore ouvertes.</Typography></Box>

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
              <Button sx={{ mt: 1 }} variant="contained"
                onClick={() => reserver(m)}
                disabled={placesExternes[m.id] >= 30}
              >
                {placesExternes[m.id] >= 30 ? 'Complet' : 'Réserver'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
      {form.masterclass_id && (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2, maxWidth: 400 }}>
          <Typography variant="h6">Réservation pour la masterclass sélectionnée</Typography>
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
