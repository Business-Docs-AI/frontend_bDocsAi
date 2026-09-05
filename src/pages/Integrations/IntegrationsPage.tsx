import Box from '@mui/material/Box';
import { PageHeader } from '@/components/common/PageHeader';

export function IntegrationsPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <PageHeader
        title="Integrations"
        subtitle="Configure integrations with external tools."
      />
      {/* TODO: cards de integração (Notion, Google Docs etc. - ver protótipo). */}
    </Box>
  );
}
