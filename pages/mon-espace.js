import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function MonEspace() {
  const router = useRouter()
  const { token } = router.query
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Envoi du lien magique
  const handleSendLink = async (e) => {
    e.preventDefault()
    setError('')
    setSent(false)
    setLoading(true)
    const res = await fetch('/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    setLoading(false)
    if (res.ok) {
      setSent(true)
    } else {
      setError("Impossible d'envoyer le lien. Vérifiez votre email.")
    }
  }

  // Vérification du token et récupération des infos utilisateur
  useEffect(() => {
    if (token) {
      setLoading(true)
      fetch(`/api/verify-magic-link?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserData(data.user)
          } else {
            setError('Lien invalide ou expiré.')
          }
          setLoading(false)
        })
    }
  }, [token])

  if (token) {
    if (loading) return <div style={{textAlign:'center',marginTop:40}}>Chargement…</div>
    if (error) return <div style={{color:'red',textAlign:'center',marginTop:40}}>{error}</div>
    if (userData) return (
      <div style={{maxWidth:500,margin:'40px auto',fontFamily:'Arial'}}>
        <h2>Bienvenue {userData.prenom} {userData.nom}</h2>
        <p>Email : {userData.email}</p>
        <h3>Badge</h3>
        {userData.valide ? (
          <a href={`/api/generatedbadge?id=${userData.id}`} target="_blank" rel="noopener noreferrer" style={{color:'#0070f3',fontWeight:'bold'}}>Télécharger mon badge</a>
        ) : (
          <span>Votre badge est en attente de validation.</span>
        )}
        <h3 style={{marginTop:30}}>Mes réservations</h3>
        <ul>
          {userData.reservations && userData.reservations.length > 0 ? userData.reservations.map((r,i) => (
            <li key={i}>{r.type} : {r.titre} ({new Date(r.date_heure).toLocaleString()})</li>
          )) : <li>Aucune réservation.</li>}
        </ul>
      </div>
    )
    return null
  }

  return (
    <div style={{maxWidth:350,margin:'80px auto',padding:24,border:'1px solid #ccc',borderRadius:8,fontFamily:'Arial'}}>
      <h2 style={{textAlign:'center'}}>Recevoir mon lien d'accès</h2>
      <form onSubmit={handleSendLink}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Votre email" required style={{width:'100%',padding:8,marginBottom:16}} />
        <button type="submit" style={{width:'100%',padding:10,background:'#0070f3',color:'#fff',border:'none',borderRadius:4,fontSize:16}} disabled={loading}>{loading ? 'Envoi…' : 'Recevoir le lien'}</button>
      </form>
      {sent && <div style={{color:'green',marginTop:16}}>Lien envoyé ! Vérifiez votre boîte mail.</div>}
      {error && <div style={{color:'red',marginTop:16}}>{error}</div>}
    </div>
  )
} 