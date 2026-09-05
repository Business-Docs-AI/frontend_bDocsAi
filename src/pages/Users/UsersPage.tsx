import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '@/components/common/PageHeader';

export function UsersPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <PageHeader
        title="Users"
        subtitle="Manage users and their permissions."
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            New user
          </Button>
        }
      />
      {/* TODO: tabela de usuários (ver protótipo). */}
    </Box>
  );
}
