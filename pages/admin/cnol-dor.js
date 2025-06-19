import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminCnolDor() {
  // Opticien de l'année
  const [opticiens, setOpticiens] = useState([]);
  const [loadingOpticien, setLoadingOpticien] = useState(true);
  // Vitrine de l'année
  const [vitrines, setVitrines] = useState([]);
  const [loadingVitrine, setLoadingVitrine] = useState(true);

  useEffect(() => {
    fetchOpticiens();
    fetchVitrines();
  }, []);

  async function fetchOpticiens() {
    setLoadingOpticien(true);
    const { data } = await supabase.from('cnol_opticien_annee').select('*').order('created_at', { ascending: false });
    setOpticiens(data || []);
    setLoadingOpticien(false);
  }
  async function fetchVitrines() {
    setLoadingVitrine(true);
    const { data } = await supabase.from('cnol_vitrine_annee').select('*').order('created_at', { ascending: false });
    setVitrines(data || []);
    setLoadingVitrine(false);
  }

  function exportOpticienCSV() {
    const header = ['Nom','Prénom','Email','Téléphone','Ville','Nom du magasin','Motivation','Date'];
    const rows = opticiens.map(o => [o.nom, o.prenom, o.email, o.telephone, o.ville, o.nom_magasin, o.motivation, o.created_at]);
    downloadCSV([header, ...rows], 'cnol_opticien_annee.csv');
  }
  function exportVitrineCSV() {
    const header = ['Nom responsable','Email','Téléphone','Ville','Nom du magasin','Description vitrine','Date'];
    const rows = vitrines.map(v => [v.nom_responsable, v.email, v.telephone, v.ville, v.nom_magasin, v.description_vitrine, v.created_at]);
    downloadCSV([header, ...rows], 'cnol_vitrine_annee.csv');
  }
  function downloadCSV(rows, filename) {
    const csv = rows.map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin – CNOL d'Or 2025</h1>
      <h2>Candidatures Opticien de l'année</h2>
      <button onClick={exportOpticienCSV}>Exporter CSV</button>
      {loadingOpticien ? <p>Chargement...</p> : (
        <table border="1" cellPadding="6" style={{ marginTop: 12, marginBottom: 32 }}>
          <thead>
            <tr>
              <th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Nom du magasin</th><th>Motivation</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {opticiens.map(o => (
              <tr key={o.id}>
                <td>{o.nom}</td><td>{o.prenom}</td><td>{o.email}</td><td>{o.telephone}</td><td>{o.ville}</td><td>{o.nom_magasin}</td><td>{o.motivation}</td><td>{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Candidatures Meilleure vitrine de l'année</h2>
      <button onClick={exportVitrineCSV}>Exporter CSV</button>
      {loadingVitrine ? <p>Chargement...</p> : (
        <table border="1" cellPadding="6" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Nom responsable</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Nom du magasin</th><th>Description vitrine</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {vitrines.map(v => (
              <tr key={v.id}>
                <td>{v.nom_responsable}</td><td>{v.email}</td><td>{v.telephone}</td><td>{v.ville}</td><td>{v.nom_magasin}</td><td>{v.description_vitrine}</td><td>{v.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 