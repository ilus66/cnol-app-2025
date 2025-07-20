import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Inscription() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    confirmEmail: '',
    telephone: '',
    fonction: '',
    ville: '',
    organisation: '',
  })
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRecover, setShowRecover] = useState(false);
  const [recoverStatus, setRecoverStatus] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    // Vérification des emails
    if (formData.email !== formData.confirmEmail) {
      setErrorMessage("Les adresses e-mail ne correspondent pas.")
      return
    }

    // Vérification des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.")
      return
    }

    // Normalisation de l'email
    const email = formData.email.trim().toLowerCase();
    const confirmEmail = formData.confirmEmail.trim().toLowerCase();
    // Normalisation de la ville
    const ville = formData.ville ? formData.ville.trim().toUpperCase() : '';
    const formDataToSend = { ...formData, email, confirmEmail, ville };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataToSend),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.message || 'Erreur lors de l\'inscription')
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setErrorMessage('Erreur inattendue : ' + error.message)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={successContainerStyle}>
        <h2>✅ Inscription réussie !</h2>
        <p>Votre badge vous sera envoyé par email après validation de l'administrateur.</p>
        <button onClick={() => router.push('/')} style={buttonStyle}>Retour à l'accueil</button>
      </div>
    )
  }

  return (
    <div style={formContainerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Formulaire d'inscription</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label>Nom *</label>
        <input name="nom" value={formData.nom} onChange={handleChange} required style={inputStyle} />

        <label>Prénom *</label>
        <input name="prenom" value={formData.prenom} onChange={handleChange} required style={inputStyle} />

        <label>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />

        <label>Confirmez votre e-mail *</label>
        <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} required style={inputStyle} />

        <label>Téléphone *</label>
        <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required style={inputStyle} />

        <label>Fonction</label>
        <select name="fonction" value={formData.fonction} onChange={handleChange} style={inputStyle}>
          <option value="">-- Sélectionnez votre fonction --</option>
          <option value="Opticien">Opticien</option>
          <option value="Ophtalmologue">Ophtalmologue</option>
          <option value="Orthoptiste">Orthoptiste</option>
          <option value="Étudiant">Étudiant</option>
          <option value="Presse">Presse</option>
          <option value="Autre">Autre</option>
        </select>

        <label>Ville</label>
        <input name="ville" value={formData.ville} onChange={handleChange} style={inputStyle} />

        <label>Nom du magasin / organisation</label>
        <input name="organisation" value={formData.organisation} onChange={handleChange} style={inputStyle} />

        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
        {/* Si l'email existe déjà, proposer la récupération */}
        {errorMessage && errorMessage.toLowerCase().includes('existe déjà') && (
          <div style={{ marginTop: 10, background: '#f8f9fa', padding: 12, borderRadius: 6, border: '1px solid #eee' }}>
            <p style={{ margin: 0 }}>Vous avez déjà un compte ? <button type="button" style={{ color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => setShowRecover(v => !v)}>{showRecover ? 'Annuler' : 'Recevoir mes identifiants par email'}</button></p>
            {showRecover && (
              <form style={{ marginTop: 10 }} onSubmit={async e => {
                e.preventDefault();
                setRecoverLoading(true);
                setRecoverStatus('');
                try {
                  const res = await fetch('/api/recover-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email })
                  });
                  const data = await res.json();
                  if (data.success) setRecoverStatus('Un email de récupération va vous être envoyé si ce compte existe.');
                  else setRecoverStatus(data.message || 'Erreur lors de la demande.');
                } catch (err) {
                  setRecoverStatus('Erreur inattendue.');
                }
                setRecoverLoading(false);
              }}>
                <input type="email" value={formData.email} disabled style={{ ...inputStyle, background: '#f1f1f1' }} />
                <button type="submit" style={{ ...buttonStyle, marginTop: 0 }} disabled={recoverLoading}>{recoverLoading ? 'Envoi...' : 'Recevoir mes identifiants'}</button>
                {recoverStatus && <p style={{ color: '#155724', marginTop: 8 }}>{recoverStatus}</p>}
              </form>
            )}
          </div>
        )}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Envoi en cours..." : "S'inscrire"}
        </button>
        {loading && <div style={{textAlign: 'center', marginTop: 10}}><span className="loader"></span></div>}
      </form>
    </div>
  )
}

const formContainerStyle = {
  maxWidth: '500px',
  margin: '50px auto',
  padding: '30px',
  borderRadius: '8px',
  backgroundColor: '#f8f9fa',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  fontFamily: 'Arial, sans-serif',
}

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
}

const inputStyle = {
  padding: '10px',
  margin: '8px 0 20px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '15px',
}

const buttonStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  padding: '12px',
  fontSize: '16px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '10px',
}

const successContainerStyle = {
  padding: '40px',
  margin: '60px auto',
  maxWidth: '500px',
  borderRadius: '8px',
  backgroundColor: '#d4edda',
  color: '#155724',
  textAlign: 'center',
  fontFamily: 'Arial, sans-serif',
}

/*
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0070f3;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
*/
