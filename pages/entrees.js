import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ListeEntrees() {
  const [entrees, setEntrees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntrees = async () => {
      const { data, error } = await supabase
        .from('entrees')
        .select('scanned_at, inscription (nom, prenom, email)')
        .order('scanned_at', { ascending: false })

      if (error) {
        console.error('Erreur de chargement:', error)
      } else {
        setEntrees(data)
      }

      setLoading(false)
    }

    fetchEntrees()
  }, [])

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>📋 Liste des entrées scannées</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : entrees.length === 0 ? (
        <p>Aucune entrée scannée.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Prénom</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Date / heure</th>
            </tr>
          </thead>
          <tbody>
            {entrees.map((entry, i) => (
              <tr key={i}>
                <td style={tdStyle}>{entry.inscription.nom}</td>
                <td style={tdStyle}>{entry.inscription.prenom}</td>
                <td style={tdStyle}>{entry.inscription.email}</td>
                <td style={tdStyle}>{new Date(entry.scanned_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle = { padding: '10px', borderBottom: '2px solid #ccc', textAlign: 'left' }
const tdStyle = { padding: '10px', borderBottom: '1px solid #eee' }
