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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  const [openAtelierId, setOpenAtelierId] = useState(null)
  const [internalResas, setInternalResas] = useState([])
  const [internalForm, setInternalForm] = useState({ nom: '', prenom: '', email: '', telephone: '' })
  const [internalError, setInternalError] = useState('')
  const [editAtelier, setEditAtelier] = useState(null)
  const [editForm, setEditForm] = useState({ titre: '', intervenant: '', date_heure: '', salle: '', places: '' })
  const [editError, setEditError] = useState('')
  const [openListAtelierId, setOpenListAtelierId] = useState(null)
  const [listResas, setListResas] = useState([])
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  useEffect(() => {
    fetchAteliers()
  }, [])

  const fetchAteliers = async () => {
    const { data, error } = await supabase.from('ateliers').select('*').order('date_heure')
    if (!error) setAteliers(data)
  }

  const handleAdd = async () => {
    setAddError('')
    setAddSuccess('')
    if (!newAtelier.titre || !newAtelier.intervenant || !newAtelier.date_heure || !newAtelier.salle || !newAtelier.places) {
      setAddError('Tous les champs sont obligatoires')
      return
    }
    const { error } = await supabase.from('ateliers').insert([newAtelier])
    if (error) {
      setAddError('Erreur lors de l\'ajout : ' + error.message)
      console.error('Erreur ajout atelier:', error)
    } else {
      setAddSuccess('Atelier ajouté avec succès !')
      setNewAtelier({ titre: '', intervenant: '', date_heure: '', salle: '', places: '' })
      fetchAteliers()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('ateliers').delete().eq('id', id)
    fetchAteliers()
  }

  const fetchInternalResas = async (atelierId) => {
    const { data } = await supabase.from('reservations_ateliers').select('*').eq('atelier_id', atelierId).eq('type', 'interne')
    setInternalResas(data || [])
  }

  const handleOpenInternal = async (atelierId) => {
    setOpenAtelierId(atelierId)
    await fetchInternalResas(atelierId)
  }

  const handleAddInternal = async () => {
    setInternalError('')
    if (!internalForm.nom || !internalForm.prenom || !internalForm.email || !internalForm.telephone) {
      setInternalError('Tous les champs sont obligatoires')
      return
    }
    if (internalResas.length >= 15) {
      setInternalError('Limite de 15 réservations internes atteinte')
      return
    }
    const res = await fetch('/api/reservation-atelier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        atelier_id: openAtelierId,
        nom: internalForm.nom,
        prenom: internalForm.prenom,
        email: internalForm.email,
        telephone: internalForm.telephone,
        type: 'interne'
      })
    })
    if (!res.ok) {
      setInternalError('Erreur lors de l\'ajout')
    } else {
      setInternalForm({ nom: '', prenom: '', email: '', telephone: '' })
      fetchInternalResas(openAtelierId)
    }
  }

  const handleOpenEdit = (atelier) => {
    setEditAtelier(atelier)
    setEditForm({
      titre: atelier.titre,
      intervenant: atelier.intervenant,
      date_heure: atelier.date_heure,
      salle: atelier.salle,
      places: atelier.places
    })
    setEditError('')
  }

  const handleEdit = async () => {
    setEditError('')
    if (!editForm.titre || !editForm.date_heure) {
      setEditError('Titre et date/heure obligatoires')
      return
    }
    const { error } = await supabase.from('ateliers').update(editForm).eq('id', editAtelier.id)
    if (error) {
      setEditError('Erreur lors de la modification')
    } else {
      setEditAtelier(null)
      fetchAteliers()
    }
  }

  const handleExport = async (atelier) => {
    // Récupérer toutes les réservations pour cet atelier
    const { data: resas } = await supabase
      .from('reservations_ateliers')
      .select('*')
      .eq('atelier_id', atelier.id)
    // Générer le CSV
    const header = [
      'Titre atelier', 'Intervenant', 'Jour/heure', 'Salle', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Type', 'Validé'
    ]
    const rows = (resas || []).map(r => [
      atelier.titre,
      atelier.intervenant,
      atelier.date_heure,
      atelier.salle,
      r.nom,
      r.prenom,
      r.email,
      r.telephone || '',
      r.type,
      r.valide ? 'Oui' : 'Non'
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atelier-${atelier.titre.replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenList = async (atelierId) => {
    setOpenListAtelierId(atelierId)
    const { data } = await supabase.from('reservations_ateliers').select('*').eq('atelier_id', atelierId)
    setListResas(data || [])
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
      {addError && <Typography color="error">{addError}</Typography>}
      {addSuccess && <Typography color="success.main">{addSuccess}</Typography>}
      <Divider sx={{ my: 2 }} />
      <List>
        {ateliers.map((a) => (
          <ListItem key={a.id} secondaryAction={
            <>
              <Button
                variant={a.publie ? 'outlined' : 'contained'}
                color={a.publie ? 'warning' : 'success'}
                size="small"
                sx={{ mr: 1 }}
                onClick={async () => {
                  await supabase.from('ateliers').update({ publie: !a.publie }).eq('id', a.id)
                  fetchAteliers()
                }}
              >
                {a.publie ? 'Cacher' : 'Publier'}
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleOpenInternal(a.id)}
              >
                Réservations internes
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleOpenEdit(a)}
              >
                Modifier
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleExport(a)}
              >
                Exporter liste
              </Button>
              <Button
                variant="outlined"
                color="success"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleOpenList(a.id)}
              >
                Voir inscrits
              </Button>
              <a
                href={`/reservation-ateliers?id=${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', marginRight: 8 }}
              >
                <Button variant="outlined" color="info" size="small">Tester réservation externe</Button>
              </a>
              <IconButton onClick={() => handleDelete(a.id)}><DeleteIcon /></IconButton>
            </>
          }>
            {a.date_heure} — {a.titre} — {a.intervenant} — {a.salle} — {a.places} places
            <span style={{ marginLeft: 16, color: a.publie ? 'green' : 'gray', fontWeight: 500 }}>
              {a.publie ? 'Publié' : 'Non publié'}
            </span>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!openAtelierId} onClose={() => setOpenAtelierId(null)}>
        <DialogTitle>Réservations internes (max 15)</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 12 }}>
            <TextField label="Nom" value={internalForm.nom} onChange={e => setInternalForm(f => ({ ...f, nom: e.target.value }))} sx={{ mr: 1 }} />
            <TextField label="Prénom" value={internalForm.prenom} onChange={e => setInternalForm(f => ({ ...f, prenom: e.target.value }))} sx={{ mr: 1 }} />
            <TextField label="Email" value={internalForm.email} onChange={e => setInternalForm(f => ({ ...f, email: e.target.value }))} />
            <TextField label="Téléphone" value={internalForm.telephone} onChange={e => setInternalForm(f => ({ ...f, telephone: e.target.value }))} sx={{ ml: 1 }} />
            <Button variant="contained" color="success" onClick={handleAddInternal} sx={{ ml: 1 }}>Ajouter</Button>
          </div>
          {internalError && <div style={{ color: 'red', marginBottom: 8 }}>{internalError}</div>}
          <ul>
            {internalResas.map((r, i) => (
              <li key={i}>{r.nom} {r.prenom} — {r.email}</li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAtelierId(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editAtelier} onClose={() => setEditAtelier(null)}>
        <DialogTitle>Modifier Atelier</DialogTitle>
        <DialogContent>
          <TextField label="Titre" value={editForm.titre} onChange={e => setEditForm(f => ({ ...f, titre: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Intervenant" value={editForm.intervenant} onChange={e => setEditForm(f => ({ ...f, intervenant: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField type="datetime-local" label="Date et Heure" InputLabelProps={{ shrink: true }} value={editForm.date_heure} onChange={e => setEditForm(f => ({ ...f, date_heure: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Salle" value={editForm.salle} onChange={e => setEditForm(f => ({ ...f, salle: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField type="number" label="Nombre de places" value={editForm.places} onChange={e => setEditForm(f => ({ ...f, places: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          {editError && <div style={{ color: 'red', marginBottom: 8 }}>{editError}</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAtelier(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleEdit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openListAtelierId} onClose={() => setOpenListAtelierId(null)} maxWidth="md" fullWidth>
        <DialogTitle>Liste des inscrits</DialogTitle>
        <DialogContent>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Type</th><th>Validé</th>
              </tr>
            </thead>
            <tbody>
              {listResas.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{r.nom}</td>
                  <td>{r.prenom}</td>
                  <td>{r.email}</td>
                  <td>{r.telephone || ''}</td>
                  <td>{r.type}</td>
                  <td>{r.valide ? 'Oui' : 'Non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenListAtelierId(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
