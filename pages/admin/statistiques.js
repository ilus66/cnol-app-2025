import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { supabase } from '../../lib/supabaseClient';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function AdminStatistiques() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    opticiens: 0,
    orthoptistes: 0,
    ophtalmos: 0,
    etudiantsAutres: 0,
    topVilles: [],
    data: []
  });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      // 1. Récupérer le vrai total (count)
      const { count } = await supabase
        .from('statistiques_participants')
        .select('*', { count: 'exact', head: true });
      // 2. Charger les données par lots de 1000
      let allRows = [];
      let from = 0;
      let to = 999;
      while (true) {
        const { data, error } = await supabase
          .from('statistiques_participants')
          .select('fonction, ville')
          .range(from, to);
        if (error) break;
        if (!data || data.length === 0) break;
        allRows = allRows.concat(data);
        if (data.length < 1000) break;
        from += 1000;
        to += 1000;
      }
      // Normalisation
      const rows = (allRows || []).map(r => ({
        fonction: (r.fonction || '').toLowerCase().trim(),
        ville: (r.ville || '').toUpperCase().trim()
      }));
      // Professions
      const orthoptistes = rows.filter(r => r.fonction.includes('orthopt')).length;
      const ophtalmos = rows.filter(r => r.fonction.includes('ophtalm')).length;
      const etudiantsAutres = rows.filter(r => r.fonction.includes('etudiant') || r.fonction === 'autre' || r.fonction === 'autres').length;
      const opticiens = (count || 0) - orthoptistes - ophtalmos - etudiantsAutres;
      // Villes
      const countByVille = {};
      rows.forEach(r => {
        if (!r.ville) return;
        countByVille[r.ville] = (countByVille[r.ville] || 0) + 1;
      });
      const topVilles = Object.entries(countByVille).sort((a, b) => b[1] - a[1]).slice(0, 10);
      setStats({
        total: count || 0,
        opticiens,
        orthoptistes,
        ophtalmos,
        etudiantsAutres,
        topVilles,
        data: rows
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Export CSV
  const exportCSV = () => {
    const header = ['Fonction', 'Ville'];
    const rows = stats.data.map(r => [r.fonction, r.ville]);
    const csvContent = [header, ...rows].map(row => row.map(val => `"${val || ''}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statistiques_participants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  // Données camembert
  const pieData = {
    labels: ['Opticiens', 'Orthoptistes', 'Ophtalmos', 'Étudiants/Autres'],
    datasets: [{
      data: [stats.opticiens, stats.orthoptistes, stats.ophtalmos, stats.etudiantsAutres],
      backgroundColor: ['#e53935', '#8e24aa', '#3949ab', '#43a047']
    }]
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Statistiques Participants</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p:2, textAlign:'center' }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p:2, textAlign:'center' }}>
            <Typography variant="h6">Opticiens</Typography>
            <Typography variant="h4">{stats.opticiens}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p:2, textAlign:'center' }}>
            <Typography variant="h6">Orthoptistes</Typography>
            <Typography variant="h4">{stats.orthoptistes}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p:2, textAlign:'center' }}>
            <Typography variant="h6">Ophtalmos</Typography>
            <Typography variant="h4">{stats.ophtalmos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p:2, textAlign:'center' }}>
            <Typography variant="h6">Étudiants/Autres</Typography>
            <Typography variant="h4">{stats.etudiantsAutres}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p:2 }}>
            <Typography variant="h6" gutterBottom>Répartition par profession</Typography>
            <Pie data={pieData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p:2 }}>
            <Typography variant="h6" gutterBottom>Top 10 villes</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ville</TableCell>
                  <TableCell>Participants</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.topVilles.map(([ville, count]) => (
                  <TableRow key={ville}>
                    <TableCell>{ville}</TableCell>
                    <TableCell>{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2} textAlign="right">
            <Button variant="contained" color="primary" onClick={exportCSV}>Exporter CSV</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 