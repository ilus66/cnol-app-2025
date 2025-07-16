import { useState } from 'react';

export default function IdentificationUniverselle() {
  const [identifiant, setIdentifiant] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const isEmail = identifiant.includes('@');
    
    if (isEmail) {
      // Utiliser directement /api/login pour les emails (même processus que identification classique)
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifiant, badgeCode: code })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          window.location.href = '/mon-espace';
        }, 1200);
      } else {
        setError(data.message || 'Erreur lors de la connexion.');
      }
    } else {
      // Pour les téléphones, utiliser l'API universelle pour chercher dans WhatsApp
      const res = await fetch('/api/auth-universelle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant, code })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          window.location.href = '/mon-espace';
        }, 1200);
      } else if (data.needEmail) {
        // Rediriger vers la page de collecte d'email
        const params = new URLSearchParams({
          nom: data.contact.nom,
          prenom: data.contact.prenom,
          telephone: data.contact.telephone,
          identifiant_badge: data.contact.identifiant_badge
        });
        window.location.href = `/collecte-email?${params.toString()}`;
      } else {
        setError(data.message || 'Erreur lors de la connexion.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Identification (Email ou Téléphone)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email ou Téléphone :</label>
          <input
            type="text"
            value={identifiant}
            onChange={e => setIdentifiant(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Votre email ou numéro de téléphone"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Code d'identification :</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Code reçu"
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
      </form>
    </div>
  );
} 