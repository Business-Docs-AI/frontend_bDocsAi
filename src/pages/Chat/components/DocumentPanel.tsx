import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { formatDateTime } from '@/pages/Chat/utils';
import type { CenterContent } from '@/pages/Chat/useChat';

interface DocumentPanelProps {
  content: CenterContent;
}

const proseStyles = {
  '& h1, & h2, & h3': { mt: 2, mb: 1, '&:first-of-type': { mt: 0 } },
  '& p': { mb: 1.25, lineHeight: 1.65 },
  '& ul, & ol': { mb: 1.25, pl: 3 },
  '& li': { mb: 0.5 },
  '& img': { maxWidth: '100%', borderRadius: 1 },
  '& table': { display: 'block', maxWidth: '100%', overflowX: 'auto', borderCollapse: 'collapse' },
  '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1, py: 0.5 },
  '& a': { color: 'primary.main' },
  '& pre': { overflowX: 'auto', bgcolor: 'background.default', p: 1.5, borderRadius: 1 },
  wordBreak: 'break-word',
} as const;

export function DocumentPanel({ content }: DocumentPanelProps) {
  if (content.kind === 'loading') {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={26} />
      </Box>
    );
  }

  if (content.kind === 'empty') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          px: 4,
          textAlign: 'center',
        }}
      >
        <DescriptionOutlinedIcon sx={{ fontSize: 42, color: 'text.disabled' }} />
        <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
          Nenhum documento selecionado — converse com a IA ao lado para criar ou abrir um.
        </Typography>
      </Box>
    );
  }

  if (content.kind === 'documentDraft') {
    const { proposta } = content;

    // Etapa 13.6: geração assíncrona em andamento — sem conteúdo ainda, mostra só um
    // indicador. O polling (useChat) atualiza este painel sozinho quando terminar.
    if (proposta.status === 'GERANDO') {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 4,
            textAlign: 'center',
          }}
        >
          <CircularProgress size={32} />
          <Typography color="text.secondary">
            Gerando o documento estruturado{proposta.titulo ? ` "${proposta.titulo}"` : ''}... isso pode levar
            alguns minutos.
          </Typography>
        </Box>
      );
    }

    if (proposta.status === 'ERRO_GERACAO') {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            px: 4,
            textAlign: 'center',
          }}
        >
          <Typography color="error" fontWeight={700}>
            Não foi possível gerar o documento
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
            {proposta.erroGeracao ?? 'Ocorreu um erro inesperado durante a geração.'}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Peça para gerar de novo, ou descarte a proposta pelo chat.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2.5, md: 4 } }}>
        <Chip
          label={proposta.tipo === 'CRIAR' ? 'Novo documento — aguardando confirmação' : 'Atualização — aguardando confirmação'}
          size="small"
          sx={{ mb: 2, fontWeight: 700, color: 'warning.main', bgcolor: '#FFF5DF' }}
        />
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Typography variant="h1" sx={{ fontSize: 24 }}>
            {proposta.titulo}
          </Typography>
          {proposta.categoriaNome && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={proposta.categoriaNome} />
            </Stack>
          )}
        </Stack>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={proseStyles} dangerouslySetInnerHTML={{ __html: proposta.conteudoHtml ?? '' }} />
      </Box>
    );
  }

  if (content.kind === 'categoryDraft') {
    // ChatPage só monta este painel para 'documentDraft' e 'document' — a proposta de
    // categoria é resolvida só pelo chat (ver ChatPanel). Guarda defensiva, não deve ocorrer.
    return null;
  }

  const { document } = content;

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2.5, md: 4 } }}>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        <Typography variant="h1" sx={{ fontSize: 24 }}>
          {document.titulo}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {document.categoriaNome && <Chip size="small" label={document.categoriaNome} />}
          <Chip size="small" variant="outlined" label={`Versão ${document.versaoAtual}`} />
          <Typography variant="caption" color="text.secondary">
            {document.criadoPor ?? 'Autor não informado'} · {formatDateTime(document.criadoEm)}
          </Typography>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2.5 }} />
      <Box sx={proseStyles} dangerouslySetInnerHTML={{ __html: document.conteudoHtml }} />
    </Box>
  );
}
