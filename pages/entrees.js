import { useEffect, useState } from 'react'

export default function ListeEntrees() {
  const [entrees, setEntrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc') // desc = plus récentes en haut
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchEntrees()
  }, [search, sort, page, pageSize])

  async function fetchEntrees() {
    setLoading(true)
    let url = `/api/entrees?search=${encodeURIComponent(search)}&sort=${sort}&page=${page}&pageSize=${pageSize}`
    const res = await fetch(url)
    const data = await res.json()
    setEntrees(data.entrees)
    setTotal(data.total)
    setLoading(false)
  }

  function handleExportCSV() {
    const header = ['Nom','Prénom','Email','Date / heure']
    const rows = entrees.map(e => [e.inscription.nom, e.inscription.prenom, e.inscription.email, new Date(e.scanned_at).toLocaleString()])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `entrees.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>📋 Liste des entrées scannées</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <input
            type="text"
            placeholder="Recherche nom, prénom, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220 }}
          />
        </div>
        <div>
          <button onClick={handleExportCSV} style={{ padding: '8px 18px', borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, marginRight: 10 }}>Exporter CSV</button>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="desc">Plus récentes en haut</option>
            <option value="asc">Plus anciennes en haut</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 10, color: '#666' }}>Total entrées : <b>{total}</b></div>
      {loading ? (
        <p>Chargement...</p>
      ) : entrees.length === 0 ? (
        <p>Aucune entrée scannée.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
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
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{entry.inscription.nom}</td>
                <td style={tdStyle}>{entry.inscription.prenom}</td>
                <td style={tdStyle}>{entry.inscription.email}</td>
                <td style={tdStyle}>{new Date(entry.scanned_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{ margin: 2, padding: '6px 14px', borderRadius: 5, border: i + 1 === page ? '2px solid #0070f3' : '1px solid #ccc', background: i + 1 === page ? '#e3f0ff' : '#fff', color: '#222', cursor: 'pointer' }}
            disabled={i + 1 === page}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

const thStyle = { padding: '10px 8px', borderBottom: '2px solid #ddd', fontWeight: 600, textAlign: 'left' }
const tdStyle = { padding: '8px 8px', borderBottom: '1px solid #eee' }
