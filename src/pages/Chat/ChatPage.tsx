import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ConversationsPanel } from '@/pages/Chat/components/ConversationsPanel';
import { DocumentPanel } from '@/pages/Chat/components/DocumentPanel';
import { ChatPanel } from '@/pages/Chat/components/ChatPanel';
import { useChat } from '@/pages/Chat/useChat';

const CHAT_COLUMN_WIDTH = 400;
const CHAT_FULL_CONTENT_MAX_WIDTH = 760;
const CONVERSATIONS_COLUMN_WIDTH = 280;
const CONVERSATIONS_COLLAPSED_WIDTH = 48;

export function ChatPage() {
  const chat = useChat();

  const isTablet = useMediaQuery('(max-width:1024px)');
  const isMobile = useMediaQuery('(max-width:768px)');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'chat'>('chat');
  const hasInitializedSidebar = useRef(false);

  useEffect(() => {
    if (!chat.conversationsLoading && !hasInitializedSidebar.current) {
      hasInitializedSidebar.current = true;
      setSidebarOpen(chat.conversations.length > 1);
    }
  }, [chat.conversationsLoading, chat.conversations.length]);

  const activeConversation = chat.conversations.find((item) => item.id === chat.activeConversationId);

  // O chat ocupa a tela inteira (como um chat de IA comum) até existir um DOCUMENTO para o
  // usuário validar/aceitar — proposta de documento, ou o documento recém-confirmado. A
  // proposta de categoria (quando nenhuma categoria existente serve) fica só na conversa —
  // o usuário confirma pelo chat (ver os botões de Confirmar/Cancelar em ChatPanel, que
  // aparecem para os dois tipos de proposta), sem precisar abrir um painel dedicado pra isso.
  // 'loading' e 'empty' nunca abrem o painel central por si só: nada de "piscar" um painel
  // vazio enquanto a conversa ainda está carregando.
  const hasDocument = chat.center.kind === 'documentDraft' || chat.center.kind === 'document';
  const showDocumentPanel = hasDocument && (!isMobile || activeTab === 'document');
  const showChatPanel = !hasDocument || !isMobile || activeTab === 'chat';

  const conversationsList = (
    <ConversationsPanel
      conversations={chat.conversations}
      activeConversationId={chat.activeConversationId}
      loading={chat.conversationsLoading}
      onSelect={(id) => {
        chat.selectConversation(id);
        setMobileDrawerOpen(false);
      }}
      onCreate={() => {
        chat.startNewConversation();
        setMobileDrawerOpen(false);
      }}
      onDelete={chat.deleteConversation}
      onExport={chat.exportConversation}
    />
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isTablet && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <IconButton size="small" onClick={() => setMobileDrawerOpen(true)} aria-label="Abrir conversas">
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography noWrap sx={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
            {activeConversation?.titulo || 'Conversa sem título'}
          </Typography>
          {isMobile && hasDocument && (
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              sx={{ minHeight: 0 }}
            >
              <Tab value="document" label="Documento" sx={{ minHeight: 0, py: 0.5, fontSize: 12 }} />
              <Tab value="chat" label="Chat" sx={{ minHeight: 0, py: 0.5, fontSize: 12 }} />
            </Tabs>
          )}
        </Stack>
      )}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {!isTablet && (
          <Box
            sx={{
              width: sidebarOpen ? CONVERSATIONS_COLUMN_WIDTH : CONVERSATIONS_COLLAPSED_WIDTH,
              flexShrink: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            {sidebarOpen ? (
              <Box sx={{ width: CONVERSATIONS_COLUMN_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pl: 2, pr: 1, pt: 1.25 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Conversas
                  </Typography>
                  <Tooltip title="Recolher">
                    <IconButton size="small" onClick={() => setSidebarOpen(false)}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                {conversationsList}
              </Box>
            ) : (
              <Stack alignItems="center" sx={{ pt: 1.5 }}>
                <Tooltip title="Mostrar conversas" placement="right">
                  <IconButton size="small" onClick={() => setSidebarOpen(true)} aria-label="Mostrar conversas">
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>
        )}

        {isTablet && (
          <Drawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
            <Box sx={{ width: CONVERSATIONS_COLUMN_WIDTH, height: '100%' }}>{conversationsList}</Box>
          </Drawer>
        )}

        {showDocumentPanel && (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              borderRight: isMobile ? 'none' : '1px solid',
              borderColor: 'divider',
            }}
          >
            <DocumentPanel content={chat.center} />
          </Box>
        )}

        {showChatPanel && (
          <Box
            sx={
              hasDocument
                ? { width: isMobile ? '100%' : CHAT_COLUMN_WIDTH, flexShrink: 0 }
                : { flex: 1, minWidth: 0 }
            }
          >
            <ChatPanel
              messages={chat.messages}
              messagesLoading={chat.messagesLoading}
              sending={chat.sending}
              hasPendingProposal={chat.hasPendingProposal}
              pendingCategoryProposal={chat.center.kind === 'categoryDraft' ? chat.center.proposta : null}
              onSend={chat.sendMessage}
              onConfirm={chat.confirmProposal}
              onCancel={chat.cancelProposal}
              onOpenSource={chat.openSource}
              contentMaxWidth={hasDocument ? undefined : CHAT_FULL_CONTENT_MAX_WIDTH}
            />
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(chat.errorMessage)}
        autoHideDuration={chat.isTimeoutWarning ? 12000 : 6000}
        onClose={chat.clearError}
      >
        <Alert
          severity={chat.isTimeoutWarning ? 'warning' : 'error'}
          onClose={chat.clearError}
          sx={{ width: '100%' }}
          action={
            chat.isTimeoutWarning ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  chat.refreshActiveConversation();
                  chat.clearError();
                }}
              >
                Atualizar
              </Button>
            ) : undefined
          }
        >
          {chat.errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
