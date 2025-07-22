import React, { useEffect, useState } from 'react';
import { 
  Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox,
  CircularProgress, Stack, Pagination, Divider, Chip
} from '@mui/material';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import useMediaQuery from '@mui/material/useMediaQuery';

const participantTypes = [
  { value: 'exposant', label: 'Exposant' },
  { value: 'intervenant', label: 'Intervenant' },
  { value: 'vip', label: 'VIP' },
  { value: 'organisation', label: 'Organisation' },
  { value: 'opticien', label: 'Opticien' },
  { value: 'ophtalmologue', label: 'Ophtalmologue' },
  { value: 'orthoptiste', label: 'Orthoptiste' },
  { value: 'étudiant', label: 'Étudiant' },
  { value: 'presse', label: 'Presse' },
  { value: 'autre', label: 'Autre' },
];

const statusFilters = [
  { value: '', label: 'Tous statuts' },
  { value: 'validated', label: 'Validé' },
  { value: 'pending', label: 'Non validé' },
];

const sourceFilters = [
  { value: '', label: 'Toutes sources' },
  { value: 'inscription', label: 'Inscription' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const PAGE_SIZE = 10;

export default function InscriptionsAdmin() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', participant_type: 'opticien', sponsoring_level: 'platinum',
    email: '', telephone: '', ville: '', fonction: '', organisation: ''
  });
  const [adding, setAdding] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => { fetchParticipants(); }, [page, search, typeFilter, statusFilter, sourceFilter, sortOrder]);

  async function fetchParticipants() {
    setLoading(true);
    try {
      // Récupérer les données des deux tables
      let inscriptionQuery = supabase.from('inscription').select('*');
      let whatsappQuery = supabase.from('whatsapp').select('*');
      
      // Appliquer les filtres de recherche
      if (search) {
        inscriptionQuery = inscriptionQuery.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%`);
        whatsappQuery = whatsappQuery.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%`);
      }
      
      // Appliquer le filtre de statut
      if (statusFilter) {
        inscriptionQuery = inscriptionQuery.eq('valide', statusFilter === 'validated');
        whatsappQuery = whatsappQuery.eq('valide', statusFilter === 'validated');
      }
      
      // Appliquer le filtre de type
      if (typeFilter) {
        inscriptionQuery = inscriptionQuery.ilike('fonction', typeFilter);
        whatsappQuery = whatsappQuery.ilike('fonction', typeFilter);
      }

      let allParticipants = [];

      // Récupérer les données selon le filtre de source
      if (sourceFilter === '' || sourceFilter === 'inscription') {
        const { data: inscriptionData, error: inscriptionError } = await inscriptionQuery;
        if (inscriptionError) {
          console.error('Erreur inscription:', inscriptionError);
        } else {
          const formattedInscriptions = inscriptionData.map(item => ({
            ...item,
            source: 'inscription',
            sourceLabel: 'Inscription'
          }));
          allParticipants = [...allParticipants, ...formattedInscriptions];
        }
      }

      if (sourceFilter === '' || sourceFilter === 'whatsapp') {
        const { data: whatsappData, error: whatsappError } = await whatsappQuery;
        if (whatsappError) {
          console.error('Erreur WhatsApp:', whatsappError);
        } else {
          const formattedWhatsapp = whatsappData.map(item => ({
            ...item,
            source: 'whatsapp',
            sourceLabel: 'WhatsApp',
            // Normaliser les champs pour correspondre à la structure inscription
            participant_type: item.participant_type || item.fonction || 'autre',
            valide: item.valide !== false, // Par défaut true pour WhatsApp si pas défini
          }));
          allParticipants = [...allParticipants, ...formattedWhatsapp];
        }
      }

      // Tri
      if (sortOrder === 'recent') {
        allParticipants.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      } else if (sortOrder === 'alpha') {
        allParticipants.sort((a, b) => {
          const nameA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
          const nameB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      }

      // Pagination
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedData = allParticipants.slice(startIndex, endIndex);

      setParticipants(paginatedData);
      setTotalCount(allParticipants.length);

    } catch (error) {
      toast.error('Erreur réseau');
      console.error('Erreur fetchParticipants:', error);
    }
    setLoading(false);
  }

  async function validerParticipant(participant) {
    try {
      const table = participant.source;
      const { error } = await supabase
        .from(table)
        .update({ valide: !participant.valide })
        .eq('id', participant.id);

      if (error) {
        toast.error(`Erreur validation : ${error.message}`);
      } else {
        toast.success(participant.valide ? 'Participant non validé' : 'Participant validé');
        fetchParticipants();
      }
    } catch (error) {
      toast.error('Erreur réseau ou serveur');
    }
  }

  function normalizePhone(phone, defaultCountryCode = '212') {
    if (!phone) return '';
    let p = phone.replace(/[^0-9+]/g, ''); // garde chiffres et +
    if (p.startsWith('+') && p.length > 8) return p;
    if (p.length > 8 && (p.startsWith('221') || p.startsWith('212') || p.startsWith('33') || p.startsWith('213'))) {
      return '+' + p;
    }
    if (p.startsWith('0')) p = p.slice(1);
    return '+' + defaultCountryCode + p;
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    const { nom, prenom, participant_type, sponsoring_level, email, telephone, ville, fonction, organisation } = formData;
    if (!nom.trim() || !prenom.trim()) {
      toast.error('Nom et prénom sont obligatoires');
      setAdding(false);
      return;
    }
    function generateBadgeCode() {
      const digits = Math.floor(100 + Math.random() * 900);
      const letters = Array(3).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      return `${digits}${letters}`;
    }
    let badgeCode;
    let isUnique = false;
    while (!isUnique) {
      badgeCode = generateBadgeCode();
      if (!participants.some(i => i.identifiant_badge === badgeCode)) isUnique = true;
    }
    try {
      const { data: inserted, error } = await supabase.from('inscription').insert([
        {
          nom: nom.trim(), prenom: prenom.trim(), participant_type,
          sponsoring_level: participant_type === 'exposant' ? sponsoring_level : null,
          fonction: fonction.trim() || (participant_type.charAt(0).toUpperCase() + participant_type.slice(1)),
          organisation: participant_type === 'exposant' ? organisation.trim() : null,
          email: email.trim(),
          telephone: normalizePhone(telephone),
          ville: ville.trim(),
          identifiant_badge: badgeCode, valide: false, scanned: false, created_at: new Date().toISOString(),
        },
      ]).select().single();
      if (error) toast.error(`Erreur ajout : ${error.message}`);
      else {
        toast.success('Inscription ajoutée !');
        setFormData({ nom: '', prenom: '', participant_type: 'opticien', sponsoring_level: 'platinum', email: '', telephone: '', ville: '', fonction: '', organisation: '' });
        fetchParticipants();
      }
    } catch (err) {
      toast.error(`Erreur serveur : ${err.message}`);
    }
    setAdding(false);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handlePrintBadge(participant) {
    // L'API generatedbadge gère déjà les deux sources automatiquement
    window.open(`/api/generatedbadge?id=${participant.id}`, '_blank');
  }

  async function exportCSV() {
    try {
      // Récupérer toutes les données des deux tables
      const { data: inscriptionData, error: inscriptionError } = await supabase.from('inscription').select('*');
      const { data: whatsappData, error: whatsappError } = await supabase.from('whatsapp').select('*');
      
      if (inscriptionError || whatsappError) {
        throw new Error('Erreur lors de la récupération des données');
      }

      // Fusionner les données avec indication de la source
      const allData = [
        ...(inscriptionData || []).map(item => ({ ...item, source: 'inscription' })),
        ...(whatsappData || []).map(item => ({ ...item, source: 'whatsapp' }))
      ];

      if (allData.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      // Créer les en-têtes en combinant toutes les clés possibles
      const allKeys = new Set();
      allData.forEach(item => Object.keys(item).forEach(key => allKeys.add(key)));
      const header = Array.from(allKeys);

      const rows = allData.map(row => header.map(h => row[h] || ''));
      const csvContent = [header, ...rows].map(row => row.map(val => `"${val}"`).join(',')).join('\n');
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'participants_complet.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Export CSV réussi');
    } catch (err) {
      toast.error('Erreur export CSV');
      console.error('Erreur export:', err);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Liste des participants ({totalCount})</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField label="Recherche" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Source</InputLabel>
          <Select value={sourceFilter} label="Source" onChange={e => { setSourceFilter(e.target.value); setPage(1); }}>
            {sourceFilters.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Statut</InputLabel>
          <Select value={statusFilter} label="Statut" onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            {statusFilters.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">Tous</MenuItem>
            {participantTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={exportCSV}>Exporter CSV</Button>
        <Button variant="outlined" onClick={() => setSortOrder(sortOrder === 'recent' ? 'alpha' : 'recent')}>
          Trier {sortOrder === 'recent' ? 'A-Z' : 'par date'}
        </Button>
      </Stack>
      
      {isMobile ? (
        <Stack spacing={2}>
          {participants.map((row) => (
            <Paper key={`${row.source}-${row.id}`} sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">{row.prenom} {row.nom}</Typography>
                    <Chip 
                      label={row.sourceLabel} 
                      size="small" 
                      color={row.source === 'inscription' ? 'primary' : 'secondary'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{row.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{row.ville}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.fonction && (row.fonction.length > 50 ? row.fonction.slice(0, 50) + '…' : row.fonction)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{row.participant_type}</Typography>
                </Box>
                <Stack spacing={1} sx={{ ml: 'auto' }}>
                  <Button size="small" variant="outlined" onClick={() => handlePrintBadge(row)}>Badge</Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color={row.valide ? 'success' : 'warning'}
                    onClick={() => validerParticipant(row)}
                  >
                    {row.valide ? 'Validé' : 'Valider'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Source</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Badge ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ville</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Validé</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9}><CircularProgress /></TableCell></TableRow>
              ) : participants.map((row) => (
                <TableRow key={`${row.source}-${row.id}`}>
                  <TableCell>
                    <Chip 
                      label={row.sourceLabel} 
                      size="small" 
                      color={row.source === 'inscription' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{row.nom}</TableCell>
                  <TableCell>{row.prenom}</TableCell>
                  <TableCell>{row.identifiant_badge}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.ville}</TableCell>
                  <TableCell>{row.fonction}</TableCell>
                  <TableCell>{row.participant_type}</TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={row.valide || false} 
                      onChange={() => validerParticipant(row)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handlePrintBadge(row)}>Badge</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <Pagination count={Math.ceil(totalCount / PAGE_SIZE)} page={page} onChange={(_, v) => setPage(v)} />
      </Stack>
      
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>Ajouter un inscrit</Typography>
      <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField label="Nom" name="nom" value={formData.nom} onChange={handleChange} required />
        <TextField label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} required />
        <TextField label="Email" name="email" value={formData.email} onChange={handleChange} />
        <TextField label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} />
        <TextField label="Ville" name="ville" value={formData.ville} onChange={handleChange} />
        <TextField label="Fonction" name="fonction" value={formData.fonction} onChange={handleChange} />
        <TextField label="Organisation (optionnel)" name="organisation" value={formData.organisation} onChange={handleChange} />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select name="participant_type" value={formData.participant_type} label="Type" onChange={handleChange}>
            {participantTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        {formData.participant_type === 'exposant' && (
          <TextField label="Organisation" name="organisation" value={formData.organisation} onChange={handleChange} />
        )}
        {formData.participant_type === 'exposant' && (
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sponsoring</InputLabel>
            <Select name="sponsoring_level" value={formData.sponsoring_level} label="Sponsoring" onChange={handleChange}>
              <MenuItem value="">Aucun</MenuItem>
              <MenuItem value="platinum">Platinum</MenuItem>
              <MenuItem value="gold">Gold</MenuItem>
              <MenuItem value="silver">Silver</MenuItem>
            </Select>
          </FormControl>
        )}
        <Button type="submit" variant="contained" disabled={adding}>{adding ? 'Ajout...' : 'Ajouter'}</Button>
      </Box>
    </Box>
  );
}
