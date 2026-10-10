import { useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { formatDateTime } from '@/pages/Chat/utils';
import type { Conversation } from '@/types';

interface ConversationsPanelProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function ConversationsPanel({
  conversations,
  activeConversationId,
  loading,
  onSelect,
  onCreate,
  onDelete,
  onExport,
}: ConversationsPanelProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleDelete(event: MouseEvent, id: string) {
    event.stopPropagation();
    setDeleteTargetId(id);
  }

  function handleCancelDelete() {
    setDeleteTargetId(null);
  }

  function handleConfirmDelete() {
    if (deleteTargetId) onDelete(deleteTargetId);
    setDeleteTargetId(null);
  }

  function handleExport(event: MouseEvent, id: string) {
    event.stopPropagation();
    onExport(id);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="contained" color="primary" startIcon={<AddIcon />} onClick={onCreate}>
          Nova conversa
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      )}

      {!loading && conversations.length === 0 && (
        <Typography color="text.secondary" sx={{ px: 2, fontSize: 13 }}>
          Nenhuma conversa ainda.
        </Typography>
      )}

      <Stack sx={{ overflowY: 'auto', flex: 1 }}>
        {conversations.map((conversation) => {
          const active = conversation.id === activeConversationId;

          return (
            <Stack
              key={conversation.id}
              direction="row"
              alignItems="center"
              spacing={1.25}
              onClick={() => onSelect(conversation.id)}
              sx={{
                px: 2,
                py: 1.1,
                cursor: 'pointer',
                borderLeft: '2px solid',
                borderLeftColor: active ? 'primary.main' : 'transparent',
                bgcolor: active ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: active ? 'primary.light' : 'action.hover' },
                '&:hover .conversation-actions': { opacity: 1 },
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: active ? '#FBD9D6' : '#F1F0EC',
                  color: active ? 'primary.dark' : 'text.secondary',
                  flexShrink: 0,
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                  {conversation.titulo || 'Conversa sem título'}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                  {formatDateTime(conversation.criadoEm)}
                </Typography>
              </Box>

              <Stack
                className="conversation-actions"
                direction="row"
                sx={{ opacity: 0, transition: 'opacity 0.15s' }}
              >
                <Tooltip title="Exportar conversa">
                  <IconButton
                    aria-label={`Exportar conversa: ${conversation.titulo ?? 'sem título'}`}
                    size="small"
                    onClick={(event) => handleExport(event, conversation.id)}
                  >
                    <DownloadOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir conversa">
                  <IconButton
                    aria-label={`Excluir conversa: ${conversation.titulo ?? 'sem título'}`}
                    size="small"
                    onClick={(event) => handleDelete(event, conversation.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          );
        })}
      </Stack>

      <Dialog open={deleteTargetId !== null} onClose={handleCancelDelete}>
        <DialogTitle>Excluir conversa?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Essa ação não pode ser desfeita. Todas as mensagens e qualquer proposta pendente
            dessa conversa serão apagadas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Não</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Sim, excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
