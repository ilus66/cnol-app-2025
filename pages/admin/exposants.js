import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function ListeExposants() {
  const [exposants, setExposants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [newQuota, setNewQuota] = useState(0);
  const [historiqueOpen, setHistoriqueOpen] = useState(false);
  const [historiqueExposant, setHistoriqueExposant] = useState(null);
  const [historiqueNotifications, setHistoriqueNotifications] = useState([]);

  useEffect(() => {
    const fetchExposants = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('exposants').select('*').order('created_at', { ascending: false });
      if (!error) setExposants(data);
      setLoading(false);
    };
    fetchExposants();
  }, []);

  const handleEditClick = (exp) => {
    setEditId(exp.id);
    setNewQuota(exp.quota_push_journalier || 0);
  };

  const handleSaveQuota = async (exp) => {
    await supabase.from('exposants').update({ quota_push_journalier: newQuota }).eq('id', exp.id);
    setEditId(null);
    // Refresh list
    const { data } = await supabase.from('exposants').select('*').order('created_at', { ascending: false });
    setExposants(data);
  };

  const handleHistoriqueClick = async (exp) => {
    setHistoriqueExposant(exp);
    setHistoriqueOpen(true);
    // Charger l'historique des notifications de cet exposant
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        visiteur:inscription(prenom, nom, email)
      `)
      .eq('exposant_id', exp.id)
      .order('created_at', { ascending: false });
    setHistoriqueNotifications(data || []);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Liste des exposants</Typography>
      {loading ? (
        <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email responsable</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell>Quota push</TableCell>
                <TableCell>Dernier reset</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exposants.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>{exp.nom}</TableCell>
                  <TableCell>{exp.email_responsable}</TableCell>
                  <TableCell>{new Date(exp.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{exp.quota_push_utilise || 0}/{exp.quota_push_journalier || 0}</TableCell>
                  <TableCell>{exp.quota_push_date || '-'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" href={`#/admin/exposant/${exp.id}`}>Gérer</Button>
                    {editId === exp.id ? (
                      <>
                        <input type="number" min={0} value={newQuota} onChange={e => setNewQuota(Number(e.target.value))} style={{ width: 60, marginLeft: 8 }} />
                        <Button size="small" onClick={() => handleSaveQuota(exp)} sx={{ ml: 1 }}>OK</Button>
                        <Button size="small" color="error" onClick={() => setEditId(null)}>Annuler</Button>
                      </>
                    ) : (
                      <Button size="small" sx={{ ml: 1 }} onClick={() => handleEditClick(exp)}>Modifier quota</Button>
                    )}
                    <Button size="small" sx={{ ml: 1 }} onClick={() => handleHistoriqueClick(exp)}>Historique</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modale Historique des notifications */}
      <Dialog open={historiqueOpen} onClose={() => setHistoriqueOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Historique des notifications - {historiqueExposant?.nom}
        </DialogTitle>
        <DialogContent>
          {historiqueNotifications.length === 0 ? (
            <Typography>Aucune notification envoyée</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Titre</TableCell>
                    <TableCell>Contenu</TableCell>
                    <TableCell>Destinataire</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historiqueNotifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell>{new Date(notif.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{notif.title}</TableCell>
                      <TableCell>{notif.body}</TableCell>
                      <TableCell>{notif.visiteur ? `${notif.visiteur.prenom} ${notif.visiteur.nom}` : 'Tous'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoriqueOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 