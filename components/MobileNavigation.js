import { useState } from 'react';
import { 
  Box, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  QrCodeScanner,
  Person,
  Notifications,
  Dashboard,
  Business,
  Event
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const actions = [
  { icon: <QrCodeScanner />, name: 'Scanner visiteur', path: '/scan-stand' },
  { icon: <QrCodeScanner />, name: 'Scanner ticket', path: '/scan-ticket' },
  { icon: <Person />, name: 'Espace staff', path: '/espace-staff' },
  { icon: <Business />, name: 'Mon stand', path: '/mon-stand' },
  { icon: <Dashboard />, name: 'Admin', path: '/admin' },
  { icon: <Event />, name: 'Programme', path: '/programme' },
];

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAction = (path) => {
    setOpen(false);
    router.push(path);
  };

  if (!isMobile) return null;

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 1000 
    }}>
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{
          '& .MuiFab-primary': {
            width: 56,
            height: 56,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }
        }}
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleAction(action.path)}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                width: 48,
                height: 48,
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
} 