import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, CircularProgress
} from '@mui/material'
import { CSVLink } from "react-csv"

export default function AdminReservationsAteliers() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('reservations_ateliers')
      .select(`
        id,
        atelier_id,
        user_id,
        atelier:atelier_id (titre, date_heure),
        user: user_id (email)
      `)

    if (!error) setRows(data)
    setLoading(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Réservations Ateliers</Typography>
      {loading ? <CircularProgress /> : (
        <>
          {rows.length > 0 && (
            <Box sx={{ my: 2 }}>
              <CSVLink
                data={rows.map(r => ({
                  Atelier: r.atelier?.titre,
                  Date: r.atelier?.date_heure,
                  Email: r.user?.email
                }))}
                filename="reservations-ateliers.csv"
                className="btn btn-primary"
              >
                Télécharger CSV
              </CSVLink>
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Atelier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.atelier?.titre}</TableCell>
                  <TableCell>{new Date(r.atelier?.date_heure).toLocaleString()}</TableCell>
                  <TableCell>{r.user?.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Box>
  )
}
