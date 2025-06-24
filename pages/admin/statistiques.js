import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Divider, CircularProgress, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function AdminStatistiques() {
  const [loading, setLoading] = useState(true);
  const [classement, setClassement] = useState([]);
  const [searchParticipant, setSearchParticipant] = useState('');
  const [standsVisites, setStandsVisites] = useState([]);
  const [searchExposant, setSearchExposant] = useState('');
  const [visiteursStand, setVisiteursStand] = useState([]);
  const [stats, setStats] = useState({});
  const [exposants, setExposants] = useState([]);
  const [selectedExposant, setSelectedExposant] = useState('tous');
  const [periode, setPeriode] = useState('7j'); // 7j, 30j, tout

  // Classement des stands les plus visités
  const fetchClassement = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('exposant_id, exposant:exposant_id (nom, prenom, qualite_sponsoring)')
      .neq('exposant_id', null);
    if (error) return setLoading(false);
    // Agréger côté client
    const countByExposant = {};
    data.forEach(l => {
      const key = l.exposant_id;
      if (!countByExposant[key]) countByExposant[key] = { ...l.exposant, count: 0 };
      countByExposant[key].count++;
    });
    setClassement(Object.values(countByExposant).sort((a, b) => b.count - a.count));
    setLoading(false);
  };

  // Recherche stands visités par un participant
  const handleSearchParticipant = async () => {
    setLoading(true);
    const { data: inscrits } = await supabase
      .from('inscription')
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

  // Recherche visiteurs d'un stand (exposant)
  const handleSearchExposant = async () => {
    setLoading(true);
    const { data: exposants } = await supabase
      .from('inscription')
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

  // Export CSV générique
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Charger la liste des exposants
      const { data: exposantsList } = await supabase
        .from('exposants')
        .select('id, nom')
        .order('nom');
      setExposants(exposantsList || []);

      // Calculer la période
      const now = new Date();
      let startDate;
      switch (periode) {
        case '7j':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30j':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      // Charger les scans
      let query = supabase
        .from('leads')
        .select(`
          *,
          exposant:exposants(nom),
          staff:staff_exposant(prenom, nom),
          visiteur:inscription(prenom, nom)
        `)
        .gte('created_at', startDate.toISOString());

      if (selectedExposant !== 'tous') {
        query = query.eq('exposant_id', selectedExposant);
      }

      const { data: scans } = await query;

      // Traiter les données pour les graphiques
      const statsData = processStatsData(scans || []);
      setStats(statsData);
      
      setLoading(false);
    };
    fetchData();
  }, [selectedExposant, periode]);

  const processStatsData = (scans) => {
    // Scans par jour
    const scansParJour = {};
    scans.forEach(scan => {
      const date = new Date(scan.created_at).toLocaleDateString();
      scansParJour[date] = (scansParJour[date] || 0) + 1;
    });

    // Scans par exposant
    const scansParExposant = {};
    scans.forEach(scan => {
      const nom = scan.exposant?.nom || 'Inconnu';
      scansParExposant[nom] = (scansParExposant[nom] || 0) + 1;
    });

    // Scans par heure
    const scansParHeure = {};
    scans.forEach(scan => {
      const heure = new Date(scan.created_at).getHours();
      scansParHeure[heure] = (scansParHeure[heure] || 0) + 1;
    });

    return {
      scansParJour: Object.entries(scansParJour).map(([date, count]) => ({ date, count })),
      scansParExposant: Object.entries(scansParExposant).map(([nom, count]) => ({ nom, count })),
      scansParHeure: Object.entries(scansParHeure).map(([heure, count]) => ({ heure: `${heure}h`, count })),
      total: scans.length
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Chargement...</Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Statistiques avancées
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Exposant</InputLabel>
              <Select
                value={selectedExposant}
                onChange={(e) => setSelectedExposant(e.target.value)}
              >
                <MenuItem value="tous">Tous les exposants</MenuItem>
                {exposants.map((exp) => (
                  <MenuItem key={exp.id} value={exp.id}>{exp.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
              >
                <MenuItem value="7j">7 derniers jours</MenuItem>
                <MenuItem value="30j">30 derniers jours</MenuItem>
                <MenuItem value="tout">Tout</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary">
              Total scans : {stats.total}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Scans par jour */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Scans par jour</Typography>
            <LineChart width={500} height={300} data={stats.scansParJour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Scans par exposant */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Scans par exposant</Typography>
            <BarChart width={500} height={300} data={stats.scansParExposant}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>

        {/* Répartition par heure */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Scans par heure</Typography>
            <BarChart width={500} height={300} data={stats.scansParHeure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="heure" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>

        {/* Répartition par exposant (camembert) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Répartition par exposant</Typography>
            <PieChart width={500} height={300}>
              <Pie
                data={stats.scansParExposant}
                cx={250}
                cy={150}
                labelLine={false}
                label={({ nom, percent }) => `${nom} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.scansParExposant.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Statistiques - CNOL</Typography>
        <Button variant="contained" onClick={fetchClassement} sx={{ mb: 2 }}>Afficher classement stands les plus visités</Button>
        {loading && <CircularProgress sx={{ ml: 2 }} />}
        {classement.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>Classement des stands les plus visités</Typography>
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
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6">Recherche stands visités par un participant</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Nom participant" value={searchParticipant} onChange={e => setSearchParticipant(e.target.value)} />
          <Button variant="contained" onClick={handleSearchParticipant}>Rechercher</Button>
        </Box>
        {standsVisites.length > 0 && (
          <>
            <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(standsVisites.map(s => [s.participant.prenom, s.participant.nom, s.exposant?.prenom, s.exposant?.nom, s.exposant?.qualite_sponsoring, s.created_at && new Date(s.created_at).toLocaleString()]), ['Prénom participant', 'Nom participant', 'Prénom exposant', 'Nom exposant', 'Sponsoring', 'Date/Heure'], 'stands-visites-par-participant.csv')}>Exporter CSV</Button>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Prénom exposant</TableCell>
                  <TableCell>Nom exposant</TableCell>
                  <TableCell>Sponsoring</TableCell>
                  <TableCell>Date/Heure</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standsVisites.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{s.exposant?.prenom}</TableCell>
                    <TableCell>{s.exposant?.nom}</TableCell>
                    <TableCell>{s.exposant?.qualite_sponsoring}</TableCell>
                    <TableCell>{s.created_at && new Date(s.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6">Recherche visiteurs d'un stand (exposant)</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Nom exposant" value={searchExposant} onChange={e => setSearchExposant(e.target.value)} />
          <Button variant="contained" onClick={handleSearchExposant}>Rechercher</Button>
        </Box>
        {visiteursStand.length > 0 && (
          <>
            <Button variant="outlined" sx={{ mb: 1 }} onClick={() => exportCSV(visiteursStand.map(v => [v.exposant.prenom, v.exposant.nom, v.visiteur?.prenom, v.visiteur?.nom, v.visiteur?.email, v.created_at && new Date(v.created_at).toLocaleString()]), ['Prénom exposant', 'Nom exposant', 'Prénom visiteur', 'Nom visiteur', 'Email visiteur', 'Date/Heure'], 'visiteurs-stand.csv')}>Exporter CSV</Button>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Prénom visiteur</TableCell>
                  <TableCell>Nom visiteur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Date/Heure</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visiteursStand.map((v, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{v.visiteur?.prenom}</TableCell>
                    <TableCell>{v.visiteur?.nom}</TableCell>
                    <TableCell>{v.visiteur?.email}</TableCell>
                    <TableCell>{v.created_at && new Date(v.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>
    </Box>
  );
} 