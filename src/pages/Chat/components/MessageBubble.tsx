import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { renderMarkdownLite } from '@/utils/markdown';
import { formatDateTime } from '@/pages/Chat/utils';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenSource: (documentoId: string) => void;
}

export function MessageBubble({ message, onOpenSource }: MessageBubbleProps) {
  const isUser = message.papel === 'USER';

  return (
    <Stack alignItems={isUser ? 'flex-end' : 'flex-start'} sx={{ width: '100%' }}>
      <Box
        sx={{
          maxWidth: '88%',
          borderRadius: 2,
          px: 1.75,
          py: 1.1,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          border: isUser ? 'none' : '1px solid',
          borderColor: 'divider',
          '& p': { m: 0, '& + p': { mt: 1 } },
          '& ul': { m: 0, mt: 0.5, pl: 2.5 },
          '& strong': { fontWeight: 700 },
        }}
      >
        <Box
          sx={{ fontSize: 13.5, lineHeight: 1.55 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(message.conteudo) }}
        />

        {message.fontes.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {message.fontes.map((fonte) => (
              <Chip
                key={`${fonte.documentoId}-${fonte.secao}`}
                size="small"
                clickable
                icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 14 }} />}
                label={fonte.titulo}
                onClick={() => onOpenSource(fonte.documentoId)}
                sx={{
                  bgcolor: isUser ? 'rgba(255,255,255,0.18)' : 'primary.light',
                  color: isUser ? 'inherit' : 'primary.dark',
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
      <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 0.4, px: 0.5 }}>
        {formatDateTime(message.criadoEm)}
      </Typography>
    </Stack>
  );
}
