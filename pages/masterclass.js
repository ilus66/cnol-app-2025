// pages/masterclass.js
import { Box, Typography, Container } from '@mui/material'

export default function MasterclassPage() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>Les Masterclass CNOL 2025</Typography>
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h6" gutterBottom>Aucune masterclass disponible pour le moment</Typography>
        <Typography variant="body1">Revenez bientôt pour découvrir nos masterclass exceptionnelles du CNOL 2025.</Typography>
      </Box>
    </Container>
  )
}
