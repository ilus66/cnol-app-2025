import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login === 'adminus' && password === 'Doumikssa$061224') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_auth', 'true')
        router.replace('/admin')
      }
    } else {
      setError('Identifiants incorrects')
    }
  }

  return (
    <div style={{ maxWidth: 350, margin: '80px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>Connexion Admin</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Login</label>
          <input type="text" value={login} onChange={e => setLogin(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} required />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16 }}>Se connecter</button>
      </form>
    </div>
  )
} 