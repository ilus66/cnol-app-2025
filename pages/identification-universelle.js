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
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 16, border: '1px solid #eee', borderRadius: 8, boxSizing: 'border-box', width: '95%', minWidth: 0 }}>
      <h2 style={{ fontSize: 22, textAlign: 'center', marginBottom: 24 }}>Identification (Email ou Téléphone)</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Email ou Téléphone :</label>
          <input
            type="text"
            value={identifiant}
            onChange={e => setIdentifiant(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 2, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
            placeholder="Votre email ou numéro de téléphone"
            autoComplete="username"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Code d'identification :</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            required
            style={{ width: '100%', padding: 10, marginTop: 2, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box', textTransform: 'uppercase' }}
            placeholder="Code reçu"
            autoComplete="one-time-code"
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 17, fontWeight: 600, marginTop: 8 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 16, fontSize: 15, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 16, fontSize: 15, textAlign: 'center' }}>{success}</div>}
      </form>
    </div>
  );
} 