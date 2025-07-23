import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Pagination, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function EntreesWhatsAppAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Ajout : état du formulaire
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    fonction: '',
    ville: ''
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/whatsapp/list-to-validate')
      .then(res => res.json())
      .then(data => {
        setRows(data.contacts || []);
        setLoading(false);
      });
  }, []);

  // Ajout : fonction pour ajouter une entrée
  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/api/whatsapp/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ nom: '', prenom: '', telephone: '', email: '', fonction: '', ville: '' });
        // Recharge la liste
        fetch('/api/whatsapp/list-to-validate')
          .then(res => res.json())
          .then(data => setRows(data.contacts || []));
      } else {
        alert('Erreur lors de l\'ajout');
      }
    } catch {
      alert('Erreur réseau');
    }
    setAdding(false);
  };

  const filteredRows = rows.filter(row =>
    row.nom && row.nom.toLowerCase().includes(search.toLowerCase())
  );
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!a.nom) return 1;
    if (!b.nom) return -1;
    return sortAsc
      ? a.nom.localeCompare(b.nom)
      : b.nom.localeCompare(a.nom);
  });
  const paginatedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSend = async (row) => {
    setSending((prev) => ({ ...prev, [row.id]: true }));
    try {
      // Utilise le nouveau processus
      const badgeRes = await fetch('/api/generatedbadge-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id })
      });
      const badgeData = await badgeRes.json();
      if (!badgeData.success) {
        alert('Erreur génération badge');
        setSending((prev) => ({ ...prev, [row.id]: false }));
        return;
      }
      // Marquer comme envoyé
      await fetch('/api/whatsapp/mark-badge-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id })
      });
      setSent((prev) => ({ ...prev, [row.id]: true }));
    } catch (e) {
      alert('Erreur lors de l\'envoi');
    }
    setSending((prev) => ({ ...prev, [row.id]: false }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Validation & Envoi badge WhatsApp</Typography>
      {/* Formulaire d'ajout */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Ajouter une entrée WhatsApp</Typography>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField label="Nom" required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          <TextField label="Prénom" required value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
          <TextField label="Téléphone" required value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
          <TextField label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <TextField label="Fonction" value={form.fonction} onChange={e => setForm(f => ({ ...f, fonction: e.target.value }))} />
          <TextField label="Ville" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
          <Button type="submit" variant="contained" disabled={adding}>{adding ? 'Ajout...' : 'Ajouter'}</Button>
        </form>
      </Paper>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Recherche nom"
          size="small"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2, width: 250 }}
        />
        <IconButton onClick={() => setSortAsc(v => !v)}>
          {sortAsc ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>
      </Box>
      {loading ? <CircularProgress /> : (
        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, i) => (
                <TableRow key={row.id || i}>
                  <TableCell>{row.nom}</TableCell>
                  <TableCell>{row.prenom}</TableCell>
                  <TableCell>{row.telephone}</TableCell>
                  <TableCell>
                    {sent[row.id] || row.badge_envoye ? (
                      <span style={{ color: 'green' }}>Envoyé</span>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSend(row)}
                        disabled={sending[row.id]}
                      >
                        {sending[row.id] ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {sent[row.id] || row.badge_envoye ? 'Envoyé' : 'À traiter'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={Math.ceil(sortedRows.length / pageSize)}
            page={page}
            onChange={(_, v) => setPage(v)}
            sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
          />
        </Paper>
      )}
    </Box>
  );
}
