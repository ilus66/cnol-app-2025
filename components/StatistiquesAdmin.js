import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabaseClient';

const StatCard = ({ title, value }) => (
  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="h4">{value}</Typography>
  </Paper>
);

export default function StatistiquesAdmin() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ville: [],
    fonction: [],
    jour: [],
    classement: [],
    totals: {
      inscrits: 0,
      valides: 0,
      exposants: 0,
      villes: 0,
      reservations: 0,
    }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        { data: villeData },
        { data: fonctionData },
        { data: jourData },
        { data: classementData },
        { count: inscritsCount },
        { count: validesCount },
        { count: exposantsCount },
        { data: villesUniquesData },
        { count: ateliersCount },
        { count: masterclassCount },
      ] = await Promise.all([
        supabase.rpc('get_stats_by_ville'),
        supabase.rpc('get_stats_by_fonction'),
        supabase.rpc('get_stats_by_day'),
        supabase.rpc('get_classement_exposants'),
        supabase.from('inscription').select('id', { count: 'exact', head: true }),
        supabase.from('inscription').select('id', { count: 'exact', head: true }).eq('valide', true),
        supabase.from('inscription').select('id', { count: 'exact', head: true }).eq('participant_type', 'exposant'),
        supabase.from('inscription').select('ville'),
        supabase.from('reservations_ateliers').select('id', { count: 'exact', head: true }),
        supabase.from('reservations_masterclass').select('id', { count: 'exact', head: true }),
      ]);

      const villes = (villesUniquesData || []).map(r => (r.ville || '').toUpperCase().trim()).filter(v => v && v !== 'NON RENSEIGNÉE');

      setStats({
        ville: villeData || [],
        fonction: fonctionData || [],
        jour: jourData || [],
        classement: classementData || [],
        totals: {
          inscrits: inscritsCount || 0,
          valides: validesCount || 0,
          exposants: exposantsCount || 0,
          villes: [...new Set(villes)].length,
          reservations: (ateliersCount || 0) + (masterclassCount || 0),
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
    setLoading(false);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard des Statistiques</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title="Total Inscrits" value={stats.totals.inscrits} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title="Inscrits Validés" value={stats.totals.valides} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title="Total Exposants" value={stats.totals.exposants} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title="Villes Uniques" value={stats.totals.villes} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title="Réservations" value={stats.totals.reservations} /></Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Inscriptions par Ville (Top 10)</Typography>
            <ResponsiveContainer>
              <BarChart data={stats.ville.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ville" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Répartition par Fonction</Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.fonction} dataKey="count" nameKey="fonction" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {stats.fonction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Inscriptions par Jour</Typography>
            <ResponsiveContainer>
              <BarChart data={stats.jour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}