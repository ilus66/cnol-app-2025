import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function CnolVitrinePage() {
  const [form, setForm] = useState({
    nom_responsable: '',
    email: '',
    telephone: '',
    ville: '',
    nom_magasin: '',
    description_vitrine: '',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { error } = await supabase.from('cnol_vitrine_annee').insert([form]);
    if (error) {
      setMsg("Erreur lors de l'envoi : " + error.message);
    } else {
      setMsg('Candidature envoyée avec succès !');
      setForm({ nom_responsable: '', email: '', telephone: '', ville: '', nom_magasin: '', description_vitrine: '' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentBox}>
        <h1 style={styles.title}>Candidature – Meilleure vitrine de l'année</h1>
        <form onSubmit={handleSubmit}>
          <input name="nom_responsable" placeholder="Nom du responsable" value={form.nom_responsable} onChange={handleChange} required /><br />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" /><br />
          <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} required /><br />
          <input name="ville" placeholder="Ville" value={form.ville} onChange={handleChange} required /><br />
          <input name="nom_magasin" placeholder="Nom du magasin" value={form.nom_magasin} onChange={handleChange} required /><br />
          <textarea name="description_vitrine" placeholder="Description de la vitrine" value={form.description_vitrine} onChange={handleChange} required /><br />
          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Envoi...' : 'Envoyer la candidature'}</button>
        </form>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #0d47a1, #1976d2)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 1rem',
  },
  contentBox: {
    maxWidth: 600,
    width: '100%',
    textAlign: 'center',
    marginTop: 48,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#fff',
    color: '#0d47a1',
    padding: '12px 24px',
    borderRadius: 6,
    fontWeight: 'bold',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: '0.2s',
  },
}; 