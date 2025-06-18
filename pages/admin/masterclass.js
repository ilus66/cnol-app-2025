import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Box, Button, TextField, Typography, List, ListItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function AdminMasterclassPage() {
  const [masterclass, setMasterclass] = useState([])
  const [form, setForm] = useState({
    titre: '', intervenant: '', date_heure: '', salle: '', places: ''
  })
  const [openMasterId, setOpenMasterId] = useState(null)
  const [internalResas, setInternalResas] = useState([])
  const [internalForm, setInternalForm] = useState({ nom: '', prenom: '', email: '' })
  const [internalError, setInternalError] = useState('')
  const [openListMasterId, setOpenListMasterId] = useState(null)
  const [listResas, setListResas] = useState([])
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const fetchMasterclass = async () => {
    const { data } = await supabase.from('masterclass').select('*').order('date_heure')
    setMasterclass(data || [])
  }

  const fetchInternalResas = async (masterId) => {
    const { data } = await supabase.from('reservations_masterclass').select('*').eq('masterclass_id', masterId).eq('type', 'interne')
    setInternalResas(data || [])
  }

  useEffect(() => { fetchMasterclass() }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    setAddError('');
    setAddSuccess('');
    // Vérification des champs requis
    if (!form.titre || !form.intervenant || !form.date_heure || !form.salle || !form.places) {
      setAddError('Tous les champs sont obligatoires');
      return;
    }
    const { error } = await supabase.from('masterclass').insert({ ...form, places: parseInt(form.places) || 0 });
    if (error) {
      setAddError('Erreur lors de l\'ajout : ' + error.message);
      console.error('Erreur ajout masterclass:', error);
    } else {
      setAddSuccess('Masterclass ajoutée avec succès !');
      setForm({ titre: '', intervenant: '', date_heure: '', salle: '', places: '' });
      fetchMasterclass();
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('masterclass').delete().eq('id', id)
    fetchMasterclass()
  }

  const handleOpenInternal = async (masterId) => {
    setOpenMasterId(masterId)
    await fetchInternalResas(masterId)
  }

  const handleAddInternal = async () => {
    setInternalError('')
    if (!internalForm.nom || !internalForm.prenom || !internalForm.email) {
      setInternalError('Tous les champs sont obligatoires')
      return
    }
    if (internalResas.length >= 15) {
      setInternalError('Limite de 15 réservations internes atteinte')
      return
    }
    const res = await fetch('/api/reservation-masterclass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterclass_id: openMasterId,
        nom: internalForm.nom,
        prenom: internalForm.prenom,
        email: internalForm.email,
        type: 'interne'
      })
    })
    if (!res.ok) {
      setInternalError('Erreur lors de l\'ajout')
    } else {
      setInternalForm({ nom: '', prenom: '', email: '' })
      fetchInternalResas(openMasterId)
    }
  }

  const handleExport = async (master) => {
    // Récupérer toutes les réservations pour cette masterclass
    const { data: resas } = await supabase
      .from('reservations_masterclass')
      .select('*')
      .eq('masterclass_id', master.id)
    // Générer le CSV
    const header = [
      'Titre masterclass', 'Intervenant', 'Jour/heure', 'Salle', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Type', 'Validé'
    ]
    const rows = (resas || []).map(r => [
      master.titre,
      master.intervenant,
      master.date_heure,
      master.salle,
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
    a.download = `masterclass-${master.titre.replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenList = async (masterId) => {
    setOpenListMasterId(masterId)
    const { data } = await supabase.from('reservations_masterclass').select('*').eq('masterclass_id', masterId)
    setListResas(data || [])
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
      {addError && <Typography color="error">{addError}</Typography>}
      {addSuccess && <Typography color="success.main">{addSuccess}</Typography>}

      <List>
        {masterclass.map((m) => (
          <ListItem key={m.id} secondaryAction={
            <>
              <Button
                variant={m.publie ? 'outlined' : 'contained'}
                color={m.publie ? 'warning' : 'success'}
                size="small"
                sx={{ mr: 1 }}
                onClick={async () => {
                  await supabase.from('masterclass').update({ publie: !m.publie }).eq('id', m.id)
                  fetchMasterclass()
                }}
              >
                {m.publie ? 'Cacher' : 'Publier'}
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleOpenInternal(m.id)}
              >
                Réservations internes
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleExport(m)}
              >
                Exporter liste
              </Button>
              <Button
                variant="outlined"
                color="success"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleOpenList(m.id)}
              >
                Voir inscrits
              </Button>
              <a
                href={`/reservation-masterclass?id=${m.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', marginRight: 8 }}
              >
                <Button variant="outlined" color="info" size="small">Tester réservation externe</Button>
              </a>
              <IconButton onClick={() => handleDelete(m.id)}><DeleteIcon /></IconButton>
            </>
          }>
            {m.titre} — {new Date(m.date_heure).toLocaleString()} — {m.places} places
            <span style={{ marginLeft: 16, color: m.publie ? 'green' : 'gray', fontWeight: 500 }}>
              {m.publie ? 'Publié' : 'Non publié'}
            </span>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!openMasterId} onClose={() => setOpenMasterId(null)}>
        <DialogTitle>Réservations internes (max 15)</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 12 }}>
            <TextField label="Nom" value={internalForm.nom} onChange={e => setInternalForm(f => ({ ...f, nom: e.target.value }))} sx={{ mr: 1 }} />
            <TextField label="Prénom" value={internalForm.prenom} onChange={e => setInternalForm(f => ({ ...f, prenom: e.target.value }))} sx={{ mr: 1 }} />
            <TextField label="Email" value={internalForm.email} onChange={e => setInternalForm(f => ({ ...f, email: e.target.value }))} />
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
          <Button onClick={() => setOpenMasterId(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openListMasterId} onClose={() => setOpenListMasterId(null)} maxWidth="md" fullWidth>
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
          <Button onClick={() => setOpenListMasterId(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
