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

  return (
    <div>
      <h1>CNOL d'Or 2025 – Inscriptions</h1>
      <p>Les CNOL d'Or récompensent les opticiens et vitrines les plus remarquables. Ce formulaire vous permet de soumettre votre candidature. Les documents nécessaires seront demandés par email après validation.</p>

      <h2>Opticien de l'année</h2>
      <form onSubmit={handleOpticienSubmit}>
        <input name="nom" placeholder="Nom" value={opticien.nom} onChange={handleOpticienChange} required /><br />
        <input name="prenom" placeholder="Prénom" value={opticien.prenom} onChange={handleOpticienChange} required /><br />
        <input name="email" placeholder="Email" value={opticien.email} onChange={handleOpticienChange} required type="email" /><br />
        <input name="telephone" placeholder="Téléphone" value={opticien.telephone} onChange={handleOpticienChange} required /><br />
        <input name="ville" placeholder="Ville" value={opticien.ville} onChange={handleOpticienChange} required /><br />
        <input name="nom_magasin" placeholder="Nom du magasin" value={opticien.nom_magasin} onChange={handleOpticienChange} required /><br />
        <textarea name="motivation" placeholder="Motivation" value={opticien.motivation} onChange={handleOpticienChange} required /><br />
        <button type="submit" disabled={opticienLoading}>{opticienLoading ? 'Envoi...' : 'Envoyer la candidature'}</button>
      </form>
      {opticienMsg && <p>{opticienMsg}</p>}

      <h2>Meilleure vitrine de l'année</h2>
      <form onSubmit={handleVitrineSubmit}>
        <input name="nom_responsable" placeholder="Nom du responsable" value={vitrine.nom_responsable} onChange={handleVitrineChange} required /><br />
        <input name="email" placeholder="Email" value={vitrine.email} onChange={handleVitrineChange} required type="email" /><br />
        <input name="telephone" placeholder="Téléphone" value={vitrine.telephone} onChange={handleVitrineChange} required /><br />
        <input name="ville" placeholder="Ville" value={vitrine.ville} onChange={handleVitrineChange} required /><br />
        <input name="nom_magasin" placeholder="Nom du magasin" value={vitrine.nom_magasin} onChange={handleVitrineChange} required /><br />
        <textarea name="description_vitrine" placeholder="Description de la vitrine" value={vitrine.description_vitrine} onChange={handleVitrineChange} required /><br />
        <button type="submit" disabled={vitrineLoading}>{vitrineLoading ? 'Envoi...' : 'Envoyer la candidature'}</button>
      </form>
      {vitrineMsg && <p>{vitrineMsg}</p>}

      <div style={{ marginTop: 40 }}>
        <p>📅 Clôture des candidatures : 15 septembre 2025</p>
        <p>📍 Remise des trophées : 12 octobre 2025 à Rabat</p>
      </div>
    </div>
  );
} 