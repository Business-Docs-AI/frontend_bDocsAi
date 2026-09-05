import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import type { Conversation } from '@/types';

/**
 * Grupos de conversas simulados. No futuro, devem vir de um hook
 * (por exemplo, useConversations) que consulta um serviço em services/api.
 */
const groups: { label: string; conversations: Conversation[] }[] = [
  {
    label: 'Today',
    conversations: [
      { id: '1', title: 'Refund policy — questions', updatedAt: '10 min ago' },
      { id: '2', title: 'Onboarding process', updatedAt: '2 hours ago' },
    ],
  },
  {
    label: 'Yesterday',
    conversations: [
      { id: '3', title: 'Company values and culture', updatedAt: 'yesterday' },
      { id: '4', title: 'Time-off request', updatedAt: 'yesterday' },
    ],
  },
];

const ACTIVE_CONVERSATION_ID = '1';

export function Sidebar() {
  function handleNewChat() {
    // TODO: integrar com o serviço de chat (criar uma nova conversa).
  }

  function handleDeleteConversation(id: string) {
    // TODO: integrar com o serviço de chat (excluir uma conversa pelo ID).
    console.log('delete conversation', id);
  }

  return (
    <Box
      component="aside"
      sx={{
        width: 280,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
        >
          New chat
        </Button>
      </Box>

      <Stack sx={{ overflowY: 'auto', flex: 1 }}>
        {groups.map((group) => (
          <Box key={group.label} sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: 'text.disabled',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                px: 2.25,
                py: 0.75,
              }}
            >
              {group.label}
            </Typography>

            {group.conversations.map((conversation) => {
              const active = conversation.id === ACTIVE_CONVERSATION_ID;

              return (
                <Stack
                  key={conversation.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  sx={{
                    px: 2.25,
                    py: 1.1,
                    cursor: 'pointer',
                    borderLeft: '2px solid',
                    borderLeftColor: active ? 'primary.main' : 'transparent',
                    bgcolor: active ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: active ? 'primary.light' : 'action.hover' },
                    '&:hover .delete-btn': { opacity: 1 },
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
                    <Typography
                      noWrap
                      sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}
                    >
                      {conversation.title}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                      {conversation.updatedAt}
                    </Typography>
                  </Box>

                  <IconButton
                    className="delete-btn"
                    aria-label={`Delete conversation: ${conversation.title}`}
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                    sx={{ opacity: 0, transition: 'opacity 0.15s' }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              );
            })}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
