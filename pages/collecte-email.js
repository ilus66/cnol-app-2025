import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CollecteEmail() {
  const router = useRouter();
  const { nom, prenom, telephone, code_identification } = router.query;
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !email2) {
      setError('Veuillez remplir les deux champs email.');
      return;
    }
    if (email !== email2) {
      setError('Les emails ne correspondent pas.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/collecte-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, telephone, code_identification, email })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setSuccess('Email enregistré, accès en cours...');
      // Créer la session côté serveur
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).then(() => {
        setTimeout(() => {
          window.location.href = '/mon-espace';
        }, 1200);
      });
      return;
    } else {
      setError(data.message || 'Erreur lors de l’enregistrement.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Complétez votre email</h2>
      <p>Pour accéder à votre espace, veuillez renseigner votre email.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Votre email"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Confirmez l'email :</label>
          <input
            type="email"
            value={email2}
            onChange={e => setEmail2(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Confirmez votre email"
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Enregistrement...' : 'Valider'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
      </form>
    </div>
  );
} 