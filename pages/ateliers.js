// pages/ateliers.js
import { Box, Typography, Container } from '@mui/material'

export default function AteliersPage() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>Les Ateliers CNOL 2025</Typography>
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h6" gutterBottom>Aucun atelier disponible pour le moment</Typography>
        <Typography variant="body1">Revenez bientôt pour découvrir nos ateliers exclusifs du CNOL 2025.</Typography>
      </Box>
    </Container>
  )
}
