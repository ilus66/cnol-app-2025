import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import jsPDF from 'jspdf';
import QRCode from 'qrcode.react';
import { saveAs } from 'file-saver';

export default function AdminExposant() {
  const router = useRouter();
  const { id } = router.query;
  const [exposant, setExposant] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', fonction: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({ total: 0, parStaff: {} });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: exp } = await supabase.from('exposants').select('*').eq('id', id).single();
      const { data: staffList } = await supabase.from('staff_exposant').select('*').eq('exposant_id', id);
      const { data: scansList } = await supabase
        .from('leads')
        .select(`
          *,
          visiteur:inscription(nom, prenom, email, fonction, societe),
          staff:staff_exposant(prenom, nom)
        `)
        .eq('exposant_id', id)
        .order('created_at', { ascending: false });
      
      setExposant(exp);
      setStaff(staffList || []);
      setScans(scansList || []);
      
      // Calculer les stats
      const totalScans = scansList?.length || 0;
      const scansParStaff = {};
      scansList?.forEach(scan => {
        const staffName = scan.staff ? `${scan.staff.prenom} ${scan.staff.nom}` : 'Exposant principal';
        scansParStaff[staffName] = (scansParStaff[staffName] || 0) + 1;
      });
      setStats({ total: totalScans, parStaff: scansParStaff });
      
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    setSuccess(false);
    // Génère un badge_code unique (UUID simple)
    const badge_code = 'STAFF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await supabase.from('staff_exposant').insert({
      ...form,
      exposant_id: id,
      badge_code
    });
    if (error) setError("Erreur lors de l'ajout du staff");
    else {
      setSuccess(true);
      setForm({ nom: '', prenom: '', email: '', fonction: '' });
      // Refresh staff list
      const { data: staffList } = await supabase.from('staff_exposant').select('*').eq('exposant_id', id);
      setStaff(staffList || []);
    }
    setAdding(false);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Génération du badge PDF
  const handleGenerateBadge = (staff, exposant) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [54, 86] }); // format badge
    doc.setFontSize(14);
    doc.text(exposant.nom, 10, 15);
    doc.setFontSize(12);
    doc.text(`${staff.prenom} ${staff.nom}`, 10, 28);
    if (staff.fonction) doc.text(staff.fonction, 10, 36);
    doc.setFontSize(10);
    doc.text('Badge staff', 10, 44);
    doc.text(`Code: ${staff.badge_code}`, 10, 50);
    // Génère le QR code en dataURL
    const canvas = document.createElement('canvas');
    const qr = QRCode.renderToCanvas(canvas, { value: staff.badge_code, size: 64 });
    setTimeout(() => {
      const qrUrl = canvas.toDataURL('image/png');
      doc.addImage(qrUrl, 'PNG', 60, 10, 20, 20);
      doc.save(`badge-${staff.prenom}-${staff.nom}.pdf`);
    }, 200);
  };

  // Téléchargement du badge staff
  const handleDownloadBadge = async (staff, exposant) => {
    const res = await fetch('/api/generate-staff-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: staff.nom,
        prenom: staff.prenom,
        fonction: staff.fonction,
        email: staff.email,
        badge_code: staff.badge_code,
        exposant_nom: exposant.nom,
      })
    });
    if (!res.ok) {
      alert('Erreur lors de la génération du badge');
      return;
    }
    const blob = await res.blob();
    saveAs(blob, `badge-${staff.prenom}-${staff.nom}.pdf`);
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!exposant) return <Alert severity="error">Exposant introuvable</Alert>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Administration exposant : {exposant.nom}</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">Fiche publique</Typography>
        <Typography>Email responsable : {exposant.email_responsable}</Typography>
        <Typography>Description : {exposant.description}</Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => router.push(`/envoyer-notification?exposant_id=${exposant.id}`)}
          >
            Envoyer une notification
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push(`/personnaliser-stand?exposant_id=${exposant.id}`)}
          >
            Personnaliser le stand
          </Button>
        </Box>
        {/* Ajouter d'autres infos si besoin */}
      </Paper>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Staff exposant</Typography>
        <form onSubmit={handleAddStaff} style={{ marginBottom: 16 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField label="Nom" name="nom" value={form.nom} onChange={handleChange} required />
            <TextField label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} required />
            <TextField label="Fonction" name="fonction" value={form.fonction} onChange={handleChange} />
            <Button type="submit" variant="contained" disabled={adding}>Ajouter</Button>
          </Box>
        </form>
        {success && <Alert severity="success">Membre ajouté !</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Badge</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.nom}</TableCell>
                  <TableCell>{s.prenom}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.fonction}</TableCell>
                  <TableCell>{s.badge_code}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleDownloadBadge(s, exposant)}>
                      Badge PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Scans et contacts</Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body2">Total scans</Typography>
          </Box>
          {Object.entries(stats.parStaff).map(([staffName, count]) => (
            <Box key={staffName} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="secondary">{count}</Typography>
              <Typography variant="body2">{staffName}</Typography>
            </Box>
          ))}
        </Box>
        
        <Typography variant="h6" gutterBottom>Liste des contacts scannés</Typography>
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={async () => {
              try {
                const res = await fetch('/api/export-contacts-exposant', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ exposant_id: exposant.id })
                });
                if (res.ok) {
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `contacts-${exposant.nom}-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } else {
                  alert('Erreur lors de l\'export');
                }
              } catch (error) {
                alert('Erreur lors de l\'export');
              }
            }}
          >
            Export contacts Excel
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visiteur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Société</TableCell>
                <TableCell>Scanné par</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>{scan.visiteur?.prenom} {scan.visiteur?.nom}</TableCell>
                  <TableCell>{scan.visiteur?.email}</TableCell>
                  <TableCell>{scan.visiteur?.fonction}</TableCell>
                  <TableCell>{scan.visiteur?.societe}</TableCell>
                  <TableCell>
                    {scan.staff ? `${scan.staff.prenom} ${scan.staff.nom}` : 'Exposant principal'}
                  </TableCell>
                  <TableCell>{new Date(scan.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
} 