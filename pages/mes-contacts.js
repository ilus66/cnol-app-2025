import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';

export default function MesContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { staff_id } = router.query;

  useEffect(() => {
    if (!staff_id) return;
    const fetchContacts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          visiteur:inscription(id, nom, prenom, email, fonction, societe),
          exposant:exposants(nom)
        `)
        .eq('staff_id', staff_id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setContacts(data);
      }
      setLoading(false);
    };
    fetchContacts();
  }, [staff_id]);

  const handleExportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Fonction', 'Société', 'Date scan'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(c => [
        c.visiteur?.nom || '',
        c.visiteur?.prenom || '',
        c.visiteur?.email || '',
        c.visiteur?.fonction || '',
        c.visiteur?.societe || '',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredContacts = contacts.filter(c => 
    c.visiteur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.visiteur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.visiteur?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', my: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Mes contacts</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Rechercher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {filteredContacts.length} contact(s) trouvé(s)
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Fonction</TableCell>
              <TableCell>Société</TableCell>
              <TableCell>Date scan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.visiteur?.nom}</TableCell>
                <TableCell>{contact.visiteur?.prenom}</TableCell>
                <TableCell>{contact.visiteur?.email}</TableCell>
                <TableCell>{contact.visiteur?.fonction}</TableCell>
                <TableCell>{contact.visiteur?.societe}</TableCell>
                <TableCell>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 