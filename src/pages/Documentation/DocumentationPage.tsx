import Box from '@mui/material/Box';
import { PageHeader } from '@/components/common/PageHeader';

export function DocumentationPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <PageHeader
        title="Documentation"
        subtitle="Find and browse documents organized by category."
      />
      {/* TODO: seções por categoria com documentos em cards (ver protótipo). */}
    </Box>
  );
}
