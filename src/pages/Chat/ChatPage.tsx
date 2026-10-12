import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
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

  // `chat.clearError` nao e memoizado no useChat, entao vai pra uma ref: se entrasse
  // nas dependencias do efeito, o timer reiniciaria a cada render e nunca dispararia.
  const clearErrorRef = useRef(chat.clearError);
  clearErrorRef.current = chat.clearError;

  useEffect(() => {
    if (!chat.conversationsLoading && !hasInitializedSidebar.current) {
      hasInitializedSidebar.current = true;
      setSidebarOpen(chat.conversations.length > 1);
    }
  }, [chat.conversationsLoading, chat.conversations.length]);

  // Equivalente ao `autoHideDuration` do Snackbar do MUI.
  useEffect(() => {
    if (!chat.errorMessage) return;

    const timeout = window.setTimeout(
      () => clearErrorRef.current(),
      chat.isTimeoutWarning ? 12000 : 6000,
    );

    return () => window.clearTimeout(timeout);
  }, [chat.errorMessage, chat.isTimeoutWarning]);

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
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {isTablet && (
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            <button
              type="button"
              aria-label="Abrir conversas"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
            >
              <Menu className="size-4" />
            </button>
            <p className="flex-1 truncate text-body font-semibold">
              {activeConversation?.titulo || 'Conversa sem título'}
            </p>
            {isMobile && hasDocument && (
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'document' | 'chat')}
              >
                <TabsList>
                  <TabsTrigger value="document" className="text-xs">
                    Documento
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="text-xs">
                    Chat
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          {!isTablet && (
            <div
              className="shrink-0 overflow-hidden border-r border-border bg-card"
              style={{
                width: sidebarOpen ? CONVERSATIONS_COLUMN_WIDTH : CONVERSATIONS_COLLAPSED_WIDTH,
              }}
            >
              {sidebarOpen ? (
                <div
                  className="flex h-full flex-col"
                  style={{ width: CONVERSATIONS_COLUMN_WIDTH }}
                >
                  <div className="flex items-center justify-between pt-2.5 pr-2 pl-4">
                    <span className="text-[11px] font-bold tracking-[0.4px] text-muted-foreground/70 uppercase">
                      Conversas
                    </span>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            aria-label="Recolher"
                            onClick={() => setSidebarOpen(false)}
                            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                        }
                      />
                      <TooltipContent>Recolher</TooltipContent>
                    </Tooltip>
                  </div>
                  {conversationsList}
                </div>
              ) : (
                <div className="flex flex-col items-center pt-3">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Mostrar conversas"
                          onClick={() => setSidebarOpen(true)}
                          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      }
                    />
                    <TooltipContent side="right">Mostrar conversas</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          )}

          {isTablet && (
            <Sheet
              open={mobileDrawerOpen}
              onOpenChange={(open) => {
                if (!open) setMobileDrawerOpen(false);
              }}
            >
              <SheetContent
                side="left"
                showCloseButton={false}
                className="p-0"
                style={{ width: CONVERSATIONS_COLUMN_WIDTH, maxWidth: '85vw' }}
              >
                <div className="h-full">{conversationsList}</div>
              </SheetContent>
            </Sheet>
          )}

          {showDocumentPanel && (
            <div
              className={cn('min-w-0 flex-1', !isMobile && 'border-r border-border')}
            >
              <DocumentPanel content={chat.center} />
            </div>
          )}

          {showChatPanel && (
            <div
              className={hasDocument && !isMobile ? 'shrink-0' : 'min-w-0 flex-1'}
              style={hasDocument && !isMobile ? { width: CHAT_COLUMN_WIDTH } : undefined}
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
            </div>
          )}
        </div>

        {chat.errorMessage && (
          <div
            role="alert"
            className={cn(
              'fixed bottom-4 left-4 right-4 z-50 flex items-start gap-3 rounded-lg border px-3 py-2.5 shadow-lg sm:right-auto sm:max-w-md',
              chat.isTimeoutWarning
                ? 'border-warning/30 bg-warning/10 text-warning'
                : 'border-destructive/25 bg-destructive/10 text-destructive',
            )}
          >
            <span className="flex-1 text-body-sm">{chat.errorMessage}</span>
            {chat.isTimeoutWarning && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 font-semibold text-inherit hover:bg-foreground/5"
                onClick={() => {
                  chat.refreshActiveConversation();
                  chat.clearError();
                }}
              >
                Atualizar
              </Button>
            )}
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={chat.clearError}
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
