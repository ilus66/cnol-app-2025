import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Tabs, Tab, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

function groupByJourSalle(sessions) {
  const map = {};
  sessions.forEach(s => {
    const key = `${s.jour}|||${s.salle}`;
    if (!map[key]) map[key] = { jour: s.jour, salle: s.salle, sessions: [] };
    map[key].sessions.push(s);
  });
  return Object.values(map);
}

export default function ProgrammeGeneral() {
  const [programme, setProgramme] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    setIsAdmin(typeof window !== 'undefined' && localStorage.getItem('role') === 'admin');
    const fetchProgramme = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('programme_general')
        .select('*')
        .order('jour', { ascending: true })
        .order('salle', { ascending: true })
        .order('heure', { ascending: true });
      if (!error && data) {
        setProgramme(groupByJourSalle(data));
        setPublished(data.length > 0 ? !!data[0].published : false);
      }
      setLoading(false);
    };
    fetchProgramme();
  }, []);

  if (loading) return <Typography>Chargement du programme...</Typography>;
  if (!programme.length) return <Typography>Aucune session programmée pour le moment.</Typography>;
  if (!published && !isAdmin) return null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Programme général du congrès
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {programme.map((grp, i) => (
            <Tab key={i} label={`${grp.jour} - ${grp.salle}`} />
          ))}
        </Tabs>
        <Divider sx={{ mb: 2 }} />
        <List>
          {programme[tab].sessions.map((session, idx) => (
            <ListItem key={session.id} alignItems="flex-start" divider={idx < programme[tab].sessions.length - 1}>
              <ListItemText
                primary={
                  <>
                    <Typography variant="subtitle1" fontWeight="bold">{session.heure}</Typography>
                    <Typography variant="body1">{session.titre}</Typography>
                  </>
                }
                secondary={session.intervenant && (
                  <Typography variant="body2" color="text.secondary">
                    {session.intervenant}
                  </Typography>
                )}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
} 