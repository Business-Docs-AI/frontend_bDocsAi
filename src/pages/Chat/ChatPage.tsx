import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

export function ChatPage() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 4,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: '#EFEDFB', color: '#5B4FCF', width: 32, height: 32 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700 }}>AS</Typography>
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Arthur Silva</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Administrator</Typography>
        </Box>
      </Stack>

      <Typography variant="h1" color="primary" sx={{ fontSize: 26, mb: 0.5 }}>
        Hello, Arthur! 👋
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        How can I help you today?
      </Typography>

      <Typography color="text.disabled" sx={{ fontSize: 13 }}>
        Chat interface to be implemented here (suggestions, question field, and message history).
      </Typography>
    </Box>
  );
}
