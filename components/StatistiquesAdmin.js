import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Grid } from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function StatistiquesAdmin() {
  const [loading, setLoading] = useState(false);
  const [classement, setClassement] = useState([]);
  const [searchParticipant, setSearchParticipant] = useState('');
  const [standsVisites, setStandsVisites] = useState([]);
  const [searchExposant, setSearchExposant] = useState('');
  const [visiteursStand, setVisiteursStand] = useState([]);
  const [statsFonction, setStatsFonction] = useState([]);
  const [statsVille, setStatsVille] = useState([]);
  const [statsJour, setStatsJour] = useState([]);
  const [statsSemaine, setStatsSemaine] = useState([]);
  const [statsMois, setStatsMois] = useState([]);
  const [totalInscrits, setTotalInscrits] = useState(0);
  const [totalValides, setTotalValides] = useState(0);
  const [totalExposants, setTotalExposants] = useState(0);
  const [totalVilles, setTotalVilles] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);

  useEffect(() => {
    supabase.from('statistiques_participants').select('id', { count: 'exact', head: true }).then(({ count }) => setTotalInscrits(count || 0));
    supabase.from('statistiques_participants').select('id', { count: 'exact', head: true }).eq('valide', true).then(({ count }) => setTotalValides(count || 0));
    supabase.from('statistiques_participants').select('id', { count: 'exact', head: true }).eq('participant_type', 'exposant').then(({ count }) => setTotalExposants(count || 0));
    supabase.from('statistiques_participants').select('ville', { count: 'exact' }).then(({ data }) => {
      const villes = (data || []).map(r => (r.ville || '').toUpperCase().trim()).filter(v => v && v !== 'NON RENSEIGNÉE');
      setTotalVilles([...new Set(villes)].length);
    });
    Promise.all([
      supabase.from('reservations_ateliers').select('id', { count: 'exact', head: true }),
      supabase.from('reservations_masterclass').select('id', { count: 'exact', head: true })
    ]).then(([a, m]) => setTotalReservations((a.count || 0) + (m.count || 0)));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const [
      { data: villeData },
      { data: fonctionData },
      { data: jourData },
      { data: semaineData },
      { data: moisData },
      { data: classementData }
    ] = await Promise.all([
      supabase.rpc('get_stats_by_ville'),
      supabase.rpc('get_stats_by_fonction'),
      supabase.rpc('get_stats_by_day'),
      supabase.rpc('get_stats_by_week'),
      supabase.rpc('get_stats_by_month'),
      supabase.rpc('get_classement_exposants')
    ]);

    setStatsVille(villeData || []);
    setStatsFonction(fonctionData || []);
    setStatsJour(jourData || []);
    setStatsSemaine(semaineData || []);
    setStatsMois(moisData || []);
    setClassement(classementData || []);
    setLoading(false);
  };

  const handleSearchParticipant = async () => {
    setLoading(true);
    const { data: inscrits } = await supabase
      .from('statistiques_participants')
      .select('id, nom, prenom, email')
      .ilike('nom', `%${searchParticipant}%`);
    if (!inscrits || inscrits.length === 0) {
      setStandsVisites([]);
      setLoading(false);
      return;
    }
    const participant = inscrits[0];
    const { data: leads } = await supabase
      .from('leads')
      .select('created_at, exposant:exposant_id (nom, prenom, qualite_sponsoring)')
      .eq('visiteur_id', participant.id);
    setStandsVisites(leads.map(l => ({ ...l, participant })));
    setLoading(false);
  };

  const handleSearchExposant = async () => {
    setLoading(true);
    const { data: exposants } = await supabase
      .from('statistiques_participants')
      .select('id, nom, prenom, qualite_sponsoring')
      .ilike('nom', `%${searchExposant}%`);
    if (!exposants || exposants.length === 0) {
      setVisiteursStand([]);
      setLoading(false);
      return;
    }
    const exposant = exposants[0];
    const { data: leads } = await supabase
      .from('leads')
      .select('created_at, visiteur:visiteur_id (nom, prenom, email)')
      .eq('exposant_id', exposant.id);
    setVisiteursStand(leads.map(l => ({ ...l, exposant })));
    setLoading(false);
  };

  const exportCSV = (rows, header, filename) => {
    const csvContent = [header, ...rows].map(row => row.map(val => `"${val || ''}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>Statistiques CNOL 2025</Typography>
      {/* Barre d'actions globales */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={fetchStats}>Rafraîchir</Button>
        <Button variant="outlined">Export global</Button>
        <Button variant="outlined" onClick={() => window.print()}>Imprimer</Button>
      </Box>
      {/* Tuiles statistiques clés */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}><Paper sx={{ p: 2, textAlign: 'center' }}>Total inscrits<br/><b>{totalInscrits}</b></Paper></Grid>
        <Grid item xs={6} md={2}><Paper sx={{ p: 2, textAlign: 'center' }}>Validés<br/><b>{totalValides}</b></Paper></Grid>
        <Grid item xs={6} md={2}><Paper sx={{ p: 2, textAlign: 'center' }}>Exposants<br/><b>{totalExposants}</b></Paper></Grid>
        <Grid item xs={6} md={2}><Paper sx={{ p: 2, textAlign: 'center' }}>Villes<br/><b>{totalVilles}</b></Paper></Grid>
        <Grid item xs={6} md={2}><Paper sx={{ p: 2, textAlign: 'center' }}>Réservations<br/><b>{totalReservations}</b></Paper></Grid>
      </Grid>
      {/* Recherche & filtres */}
      <Box sx={{ mb: 3 }}>
        <TextField label="Recherche globale" sx={{ mr: 2 }} />
        <TextField label="Filtre période" sx={{ mr: 2 }} />
        <TextField label="Filtre ville" sx={{ mr: 2 }} />
        <TextField label="Filtre fonction" sx={{ mr: 2 }} />
        <TextField label="Validé ?" sx={{ mr: 2 }} />
      </Box>
      {/* Accordéons statistiques détaillées */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Inscrits par ville</b></AccordionSummary>
        <AccordionDetails>
          {/* Bloc existant statsVille ici */}
          {statsVille.length > 0 && (
            <>
              <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(statsVille.map(v => [v.ville, v.count]), ['Ville', 'Nombre'], 'statistiques-par-ville.csv')}>Exporter CSV</Button>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ville</TableCell>
                    <TableCell>Nombre</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statsVille.slice().sort((a, b) => b.count - a.count).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.ville || 'Non renseignée'}</TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Inscrits par fonction</b></AccordionSummary>
        <AccordionDetails>
          {/* Bloc existant statsFonction ici */}
          {statsFonction.length > 0 && (
            <>
              <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(statsFonction.map(f => [f.fonction, f.count]), ['Fonction', 'Nombre'], 'statistiques-par-fonction.csv')}>Exporter CSV</Button>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fonction</TableCell>
                    <TableCell>Nombre</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statsFonction.slice().sort((a, b) => b.count - a.count).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.fonction || 'Non renseigné'}</TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Inscrits par période</b></AccordionSummary>
        <AccordionDetails>
          {/* Par jour */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Par jour</Typography>
          <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(statsJour.map(j => [j.periode, j.count]), ['Jour', 'Nombre'], 'inscrits-par-jour.csv')}>Exporter CSV</Button>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Jour</TableCell>
                <TableCell>Nombre</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsJour.slice().sort((a, b) => b.count - a.count).map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.jour}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Par semaine */}
          <Typography variant="subtitle1" sx={{ mt: 3 }}>Par semaine</Typography>
          <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(statsSemaine.map(s => [s.periode, s.count]), ['Semaine', 'Nombre'], 'inscrits-par-semaine.csv')}>Exporter CSV</Button>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Semaine</TableCell>
                <TableCell>Nombre</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsSemaine.slice().sort((a, b) => b.count - a.count).map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.semaine}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Par mois */}
          <Typography variant="subtitle1" sx={{ mt: 3 }}>Par mois</Typography>
          <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(statsMois.map(m => [m.periode, m.count]), ['Mois', 'Nombre'], 'inscrits-par-mois.csv')}>Exporter CSV</Button>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mois</TableCell>
                <TableCell>Nombre</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsMois.slice().sort((a, b) => b.count - a.count).map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.mois}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Classement stands les plus visités</b></AccordionSummary>
        <AccordionDetails>
          {/* Bloc existant classement ici */}
          {classement.length > 0 && (
            <>
              <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(classement.map(e => [e.prenom, e.nom, e.qualite_sponsoring, e.count]), ['Prénom', 'Nom', 'Sponsoring', 'Nombre de visiteurs'], 'classement-stands.csv')}>Exporter CSV</Button>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Sponsoring</TableCell>
                    <TableCell>Nombre de visiteurs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classement.map((e, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{e.prenom}</TableCell>
                      <TableCell>{e.nom}</TableCell>
                      <TableCell>{e.qualite_sponsoring}</TableCell>
                      <TableCell>{e.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Recherche avancée</b></AccordionSummary>
        <AccordionDetails>
          <Typography>Recherche participants, exposants, etc. (à compléter)</Typography>
        </AccordionDetails>
      </Accordion>
      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'grey.600', fontSize: 13 }}>
        CNOL 2025 – Admin | Version 1.0 | Support : cnol.badge@gmail.com
      </Box>
    </Box>
  );
} 