import { useState } from 'react'
import QRCodeScanner from '../components/QRCodeScanner'

export default function ScanTicket() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScan = async (data) => {
    if (!data) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/scan-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: data })
      })
      const json = await res.json()
      if (res.ok) {
        setResult(json)
      } else {
        setError(json.message || 'Erreur inconnue')
      }
    } catch (e) {
      setError('Erreur réseau')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Scan ticket atelier/masterclass</h2>
      <QRCodeScanner onScan={handleScan} />
      {loading && <p>Vérification...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Résultat</h3>
          <p><b>Nom :</b> {result.nom} {result.prenom}</p>
          <p><b>Email :</b> {result.email}</p>
          <p><b>Type :</b> {result.eventType}</p>
          <p><b>Atelier/Masterclass :</b> {result.eventTitle}</p>
          <p><b>Date :</b> {new Date(result.eventDate).toLocaleString()}</p>
          <p><b>Statut :</b> {result.scanned ? 'Déjà scanné' : 'Validé (nouveau scan)'}</p>
        </div>
      )}
    </div>
  )
} 