import ProgrammeGeneral from '../components/ProgrammeGeneral';
import { Box, Typography } from '@mui/material';

export default function ProgrammePage() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Programme général du congrès
      </Typography>
      <ProgrammeGeneral />
    </Box>
  );
} 