import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Box, Button, TextField, Typography, List, ListItem, IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function AdminMasterclassPage() {
  const [masterclass, setMasterclass] = useState([])
  const [form, setForm] = useState({
    titre: '', intervenant: '', date_heure: '', salle: '', places: ''
  })

  const fetchMasterclass = async () => {
    const { data } = await supabase.from('masterclass').select('*').order('date_heure')
    setMasterclass(data || [])
  }

  useEffect(() => { fetchMasterclass() }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    if (!form.titre || !form.date_heure) return
    await supabase.from('masterclass').insert({ ...form, places: parseInt(form.places) || 0 })
    setForm({ titre: '', intervenant: '', date_heure: '', salle: '', places: '' })
    fetchMasterclass()
  }

  const handleDelete = async (id) => {
    await supabase.from('masterclass').delete().eq('id', id)
    fetchMasterclass()
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>Configuration des Masterclass</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', mb: 3 }}>
        <TextField label="Titre" name="titre" value={form.titre} onChange={handleChange} />
        <TextField label="Intervenant" name="intervenant" value={form.intervenant} onChange={handleChange} />
        <TextField type="datetime-local" name="date_heure" value={form.date_heure} onChange={handleChange} />
        <TextField label="Salle" name="salle" value={form.salle} onChange={handleChange} />
        <TextField label="Places" name="places" type="number" value={form.places} onChange={handleChange} />
        <Button variant="contained" onClick={handleAdd}>Ajouter</Button>
      </Box>

      <List>
        {masterclass.map((m) => (
          <ListItem key={m.id} secondaryAction={
            <IconButton onClick={() => handleDelete(m.id)}><DeleteIcon /></IconButton>
          }>
            {m.titre} — {new Date(m.date_heure).toLocaleString()} — {m.places} places
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
