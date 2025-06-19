import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CnolDorPage() {
  // États pour le formulaire Opticien de l'année
  const [opticien, setOpticien] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: '',
    nom_magasin: '',
    motivation: '',
  });
  const [opticienMsg, setOpticienMsg] = useState('');
  const [opticienLoading, setOpticienLoading] = useState(false);

  // États pour le formulaire Meilleure vitrine
  const [vitrine, setVitrine] = useState({
    nom_responsable: '',
    email: '',
    telephone: '',
    ville: '',
    nom_magasin: '',
    description_vitrine: '',
  });
  const [vitrineMsg, setVitrineMsg] = useState('');
  const [vitrineLoading, setVitrineLoading] = useState(false);

  // Handlers Opticien
  const handleOpticienChange = e => {
    setOpticien({ ...opticien, [e.target.name]: e.target.value });
  };
  const handleOpticienSubmit = async e => {
    e.preventDefault();
    setOpticienLoading(true);
    setOpticienMsg('');
    const { error } = await supabase.from('cnol_opticien_annee').insert([opticien]);
    if (error) {
      setOpticienMsg("Erreur lors de l'envoi : " + error.message);
    } else {
      setOpticienMsg('Candidature envoyée avec succès !');
      setOpticien({ nom: '', prenom: '', email: '', telephone: '', ville: '', nom_magasin: '', motivation: '' });
    }
    setOpticienLoading(false);
  };

  // Handlers Vitrine
  const handleVitrineChange = e => {
    setVitrine({ ...vitrine, [e.target.name]: e.target.value });
  };
  const handleVitrineSubmit = async e => {
    e.preventDefault();
    setVitrineLoading(true);
    setVitrineMsg('');
    const { error } = await supabase.from('cnol_vitrine_annee').insert([vitrine]);
    if (error) {
      setVitrineMsg("Erreur lors de l'envoi : " + error.message);
    } else {
      setVitrineMsg('Candidature envoyée avec succès !');
      setVitrine({ nom_responsable: '', email: '', telephone: '', ville: '', nom_magasin: '', description_vitrine: '' });
    }
    setVitrineLoading(false);
  };

  // Scroll vers l'ancre
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentBox}>
        <h1 style={styles.title}>CNOL d'Or 2025 – Inscriptions</h1>
        <p style={styles.intro}>
          Les CNOL d'Or récompensent les opticiens et vitrines les plus remarquables.<br />
          Ce formulaire vous permet de soumettre votre candidature.<br />
          Les documents nécessaires seront demandés par email après validation.
        </p>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={() => scrollTo('opticien')}>Candidater Opticien de l'année</button>
          <button style={styles.button} onClick={() => scrollTo('vitrine')}>Candidater Meilleure vitrine</button>
        </div>
        <div style={styles.datesBox}>
          <p>📅 Clôture des candidatures : 15 septembre 2025</p>
          <p>📍 Remise des trophées : 12 octobre 2025 à Rabat</p>
        </div>
      </div>

      <div id="opticien" style={styles.formBox}>
        <h2>Opticien de l'année</h2>
        <form onSubmit={handleOpticienSubmit}>
          <input name="nom" placeholder="Nom" value={opticien.nom} onChange={handleOpticienChange} required /><br />
          <input name="prenom" placeholder="Prénom" value={opticien.prenom} onChange={handleOpticienChange} required /><br />
          <input name="email" placeholder="Email" value={opticien.email} onChange={handleOpticienChange} required type="email" /><br />
          <input name="telephone" placeholder="Téléphone" value={opticien.telephone} onChange={handleOpticienChange} required /><br />
          <input name="ville" placeholder="Ville" value={opticien.ville} onChange={handleOpticienChange} required /><br />
          <input name="nom_magasin" placeholder="Nom du magasin" value={opticien.nom_magasin} onChange={handleOpticienChange} required /><br />
          <textarea name="motivation" placeholder="Motivation" value={opticien.motivation} onChange={handleOpticienChange} required /><br />
          <button type="submit" disabled={opticienLoading} style={styles.button}>{opticienLoading ? 'Envoi...' : 'Envoyer la candidature'}</button>
        </form>
        {opticienMsg && <p>{opticienMsg}</p>}
      </div>

      <div id="vitrine" style={styles.formBox}>
        <h2>Meilleure vitrine de l'année</h2>
        <form onSubmit={handleVitrineSubmit}>
          <input name="nom_responsable" placeholder="Nom du responsable" value={vitrine.nom_responsable} onChange={handleVitrineChange} required /><br />
          <input name="email" placeholder="Email" value={vitrine.email} onChange={handleVitrineChange} required type="email" /><br />
          <input name="telephone" placeholder="Téléphone" value={vitrine.telephone} onChange={handleVitrineChange} required /><br />
          <input name="ville" placeholder="Ville" value={vitrine.ville} onChange={handleVitrineChange} required /><br />
          <input name="nom_magasin" placeholder="Nom du magasin" value={vitrine.nom_magasin} onChange={handleVitrineChange} required /><br />
          <textarea name="description_vitrine" placeholder="Description de la vitrine" value={vitrine.description_vitrine} onChange={handleVitrineChange} required /><br />
          <button type="submit" disabled={vitrineLoading} style={styles.button}>{vitrineLoading ? 'Envoi...' : 'Envoyer la candidature'}</button>
        </form>
        {vitrineMsg && <p>{vitrineMsg}</p>}
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
    marginBottom: 32,
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
  intro: {
    fontSize: '1.1rem',
    marginBottom: 24,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
    flexWrap: 'wrap',
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
  datesBox: {
    marginTop: 24,
    fontSize: '1.1rem',
  },
  formBox: {
    background: 'rgba(255,255,255,0.10)',
    color: '#222',
    borderRadius: 10,
    padding: 24,
    margin: '32px auto',
    maxWidth: 500,
    width: '100%',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
}; 