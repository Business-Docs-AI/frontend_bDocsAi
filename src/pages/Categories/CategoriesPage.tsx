import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '@/components/common/PageHeader';

export function CategoriesPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <PageHeader
        title="Categories"
        subtitle="Manage document categories."
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            New category
          </Button>
        }
      />
      {/* TODO: tabela de categorias (ver protótipo). */}
    </Box>
  );
}
