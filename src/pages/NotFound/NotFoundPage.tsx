import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: 48 }} color="primary">
        404
      </Typography>
      <Typography color="text.secondary">Page not found.</Typography>
      <Button component={RouterLink} to={paths.chat} variant="contained" sx={{ mt: 1 }}>
       Back to chat
      </Button>
    </Box>
  );
}
