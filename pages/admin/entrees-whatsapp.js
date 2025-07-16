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

  useEffect(() => {
    setLoading(true);
    fetch('/api/whatsapp/list-to-validate')
      .then(res => res.json())
      .then(data => {
        setRows(data.contacts || []);
        setLoading(false);
      });
  }, []);

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
      // 1. Générer le badge
      const badgeRes = await fetch('/api/whatsapp/generate-badge', {
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
      // 2. Générer le message WhatsApp
      const whatsappMessage = `\nBonjour ${row.prenom} ${row.nom},\n\nVotre badge nominatif CNOL 2025 est en pièce jointe (PDF).\n\nVous pouvez également le télécharger ici :\n${badgeData.badgeUrl}\n\nPour accéder à l'application CNOL 2025 (programme, notifications, espace personnel…), téléchargez-la ici :\nhttps://www.app.cnol.ma\n\nVos identifiants d'accès :\nNuméro de téléphone : ${row.telephone}\nCode badge : ${badgeData.badgeCode}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc\n`;
      // 3. Envoyer via WhatsApp
      const sendRes = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: row.telephone,
          text: whatsappMessage,
          documentUrl: badgeData.badgeUrl,
          fileName: `badge-${row.nom}-${row.prenom}.pdf`
        })
      });
      const sendData = await sendRes.json();
      if (sendData.success) {
        alert('Badge envoyé via WhatsApp !');
        // 4. Marquer comme envoyé
        await fetch('/api/whatsapp/mark-badge-sent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: row.id })
        });
        setSent((prev) => ({ ...prev, [row.id]: true }));
      } else {
        alert('Erreur lors de l\'envoi WhatsApp');
      }
    } catch (e) {
      alert('Erreur lors de l\'envoi');
    }
    setSending((prev) => ({ ...prev, [row.id]: false }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Validation & Envoi badge WhatsApp</Typography>
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
