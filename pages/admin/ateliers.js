import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  IconButton,
  Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function AdminAteliers() {
  const [ateliers, setAteliers] = useState([])
  const [newAtelier, setNewAtelier] = useState({
    titre: '',
    intervenant: '',
    date_heure: '',
    salle: '',
    places: ''
  })

  useEffect(() => {
    fetchAteliers()
  }, [])

  const fetchAteliers = async () => {
    const { data, error } = await supabase.from('ateliers').select('*').order('date_heure')
    if (!error) setAteliers(data)
  }

  const handleAdd = async () => {
    const { error } = await supabase.from('ateliers').insert([newAtelier])
    if (!error) {
      setNewAtelier({ titre: '', intervenant: '', date_heure: '', salle: '', places: '' })
      fetchAteliers()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('ateliers').delete().eq('id', id)
    fetchAteliers()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Gestion des Ateliers</Typography>
      <Box sx={{ my: 2, display: 'grid', gap: 2 }}>
        <TextField label="Titre" value={newAtelier.titre} onChange={e => setNewAtelier({ ...newAtelier, titre: e.target.value })} />
        <TextField label="Intervenant" value={newAtelier.intervenant} onChange={e => setNewAtelier({ ...newAtelier, intervenant: e.target.value })} />
        <TextField type="datetime-local" label="Date et Heure" InputLabelProps={{ shrink: true }} value={newAtelier.date_heure} onChange={e => setNewAtelier({ ...newAtelier, date_heure: e.target.value })} />
        <TextField label="Salle" value={newAtelier.salle} onChange={e => setNewAtelier({ ...newAtelier, salle: e.target.value })} />
        <TextField type="number" label="Nombre de places" value={newAtelier.places} onChange={e => setNewAtelier({ ...newAtelier, places: e.target.value })} />
        <Button variant="contained" onClick={handleAdd}>Ajouter</Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <List>
        {ateliers.map((a) => (
          <ListItem key={a.id} secondaryAction={<IconButton onClick={() => handleDelete(a.id)}><DeleteIcon /></IconButton>}>
            {a.date_heure} — {a.titre} — {a.intervenant} — {a.salle} — {a.places} places
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
