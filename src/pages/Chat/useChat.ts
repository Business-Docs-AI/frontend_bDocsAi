import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService, type SendMessageAttachments } from '@/services/api/chatService';
import { documentsService } from '@/services/api/documentsService';
import { getApiErrorMessage, isTimeoutError } from '@/services/api/httpClient';
import type { ChatMessage, Conversation, Document, PropostaCategoria, PropostaDocumento } from '@/types';

export type CenterContent =
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'documentDraft'; proposta: PropostaDocumento }
  | { kind: 'categoryDraft'; proposta: PropostaCategoria }
  | { kind: 'document'; document: Document };

// Tempo de sobra pro título automático da conversa (gerado em background pelo backend,
// ver ChatTituloListener) terminar antes de atualizar a lista de conversas.
const TITLE_REFRESH_DELAY_MS = 4000;

const TIMEOUT_WARNING_MESSAGE =
  'A resposta demorou mais que o esperado. Atualize a conversa para verificar se algo foi criado antes de tentar de novo.';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [center, setCenter] = useState<CenterContent>({ kind: 'empty' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTimeoutWarning, setIsTimeoutWarning] = useState(false);
  const hasBootstrapped = useRef(false);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const data = await chatService.listConversations();
      setConversations(data);
      return data;
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível carregar as conversas.'));
      return [];
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Deriva o conteúdo do painel central SEMPRE a partir do rascunho pendente lido do
  // backend — nunca interpretando o texto da IA, e nunca abrindo automaticamente um
  // documento só porque foi citado como fonte numa resposta (isso só acontece por ação
  // explícita do usuário, ver openSource). O painel central só deve aparecer quando há algo
  // para o usuário validar/aceitar — não a qualquer momento em que exista um documento
  // relacionado à conversa. Quando nada está pendente, `onNothingPending` decide o que fazer:
  // ao trocar de conversa é seguro voltar pro vazio, mas no meio de uma conversa (uma
  // pergunta de acompanhamento) não se deve apagar um documento/rascunho que já estava
  // aberto — só uma proposta que acabou de ser resolvida (confirmada/descartada).
  const applyPendingDraft = useCallback(
    async (conversationId: string, onNothingPending: () => void) => {
      try {
        const pending = await chatService.getPendingDraft(conversationId);
        if (pending.propostaDocumento) {
          setCenter({ kind: 'documentDraft', proposta: pending.propostaDocumento });
          return;
        }
        if (pending.propostaCategoria) {
          setCenter({ kind: 'categoryDraft', proposta: pending.propostaCategoria });
          return;
        }
      } catch {
        // Sem leitura confiável do estado pendente: não arrisca mostrar algo errado.
      }

      onNothingPending();
    },
    [],
  );

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      setMessagesLoading(true);
      setCenter({ kind: 'loading' });

      try {
        const history = await chatService.getMessages(conversationId);
        setMessages(history);

        await applyPendingDraft(conversationId, () => setCenter({ kind: 'empty' }));
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err, 'Não foi possível carregar o histórico da conversa.'));
      } finally {
        setMessagesLoading(false);
      }
    },
    [applyPendingDraft],
  );

  const startNewConversation = useCallback(async () => {
    try {
      const conversation = await chatService.createConversation();
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      setCenter({ kind: 'empty' });
      return conversation;
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível criar uma nova conversa.'));
      return null;
    }
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await chatService.deleteConversation(conversationId);
        const remaining = conversations.filter((item) => item.id !== conversationId);
        setConversations(remaining);

        if (activeConversationId === conversationId) {
          if (remaining.length > 0) {
            await selectConversation(remaining[0].id);
          } else {
            setActiveConversationId(null);
            setMessages([]);
            setCenter({ kind: 'empty' });
          }
        }
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err, 'Não foi possível excluir a conversa.'));
      }
    },
    [activeConversationId, conversations, selectConversation],
  );

  const sendMessage = useCallback(
    async (pergunta: string, attachments?: Omit<SendMessageAttachments, 'pergunta'>) => {
      let conversationId = activeConversationId;
      let conversationHadNoTitle: boolean;
      let hadDraftBefore: boolean;

      if (!conversationId) {
        // Tela inicial sem nenhuma conversa ainda: cria uma sob demanda, na hora de enviar a
        // primeira mensagem, em vez de depender de uma criação automática no carregamento da
        // página — essa criação em background competia com o envio, e mandar a mensagem
        // rápido demais (antes dela terminar) fazia sendMessage descartá-la em silêncio.
        const conversation = await startNewConversation();
        if (!conversation) return;
        conversationId = conversation.id;
        conversationHadNoTitle = true;
        hadDraftBefore = false;
      } else {
        conversationHadNoTitle = conversations.find((item) => item.id === conversationId)?.titulo == null;
        hadDraftBefore = center.kind === 'documentDraft' || center.kind === 'categoryDraft';
      }

      const optimisticUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        papel: 'USER',
        conteudo: pergunta || (attachments?.anexo ? `Anexo: ${attachments.anexo.name}` : 'Áudio enviado'),
        fontes: [],
        propostaDocumento: null,
        propostaCategoria: null,
        documentoConfirmado: null,
        criadoEm: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMessage]);
      setSending(true);
      setErrorMessage(null);
      setIsTimeoutWarning(false);

      try {
        const assistantMessage =
          attachments?.audio || attachments?.anexo
            ? await chatService.sendMessageWithAttachments(conversationId, { pergunta, ...attachments })
            : await chatService.sendMessage(conversationId, pergunta);

        setMessages((prev) => [...prev, assistantMessage]);

        // Prioridade: documento recém-confirmado > o que estiver pendente agora (lido do
        // backend). Nunca interpreta o texto da resposta nem abre um documento automaticamente
        // só por ter sido citado como fonte.
        if (assistantMessage.documentoConfirmado) {
          setCenter({ kind: 'document', document: assistantMessage.documentoConfirmado });
        } else {
          await applyPendingDraft(conversationId, () => {
            if (hadDraftBefore) setCenter({ kind: 'empty' });
          });
        }

        if (conversationHadNoTitle) {
          setTimeout(() => {
            loadConversations();
          }, TITLE_REFRESH_DELAY_MS);
        }
      } catch (err) {
        if (isTimeoutError(err)) {
          // Timeout do lado do cliente: o backend pode ter processado a mensagem mesmo
          // assim, então não apresenta como falha definitiva nem descarta a bolha otimista.
          setErrorMessage(TIMEOUT_WARNING_MESSAGE);
          setIsTimeoutWarning(true);
        } else {
          setErrorMessage(getApiErrorMessage(err));
          setMessages((prev) => prev.filter((message) => message.id !== optimisticUserMessage.id));
        }
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, applyPendingDraft, center.kind, conversations, loadConversations, startNewConversation],
  );

  const refreshActiveConversation = useCallback(() => {
    if (activeConversationId) {
      selectConversation(activeConversationId);
    }
  }, [activeConversationId, selectConversation]);

  const confirmProposal = useCallback(async () => {
    await sendMessage('Sim, confirmo a criação.');
  }, [sendMessage]);

  const cancelProposal = useCallback(async () => {
    await sendMessage('Não, descarte a proposta.');
  }, [sendMessage]);

  const openSource = useCallback(async (documentoId: string) => {
    setCenter({ kind: 'loading' });
    try {
      const document = await documentsService.getById(documentoId);
      setCenter({ kind: 'document', document });
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível abrir o documento.'));
      setCenter({ kind: 'empty' });
    }
  }, []);

  const exportConversation = useCallback(async (conversationId: string) => {
    try {
      const markdown = await chatService.exportConversation(conversationId);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversa-${conversationId}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível exportar a conversa.'));
    }
  }, []);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    loadConversations().then(async (list) => {
      // Sem nenhuma conversa ainda, não cria uma automaticamente — fica na tela cheia vazia
      // (ver ChatPanel) e a conversa só nasce sob demanda, no primeiro envio (ver sendMessage).
      if (list.length > 0) {
        await selectConversation(list[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPendingProposal = center.kind === 'documentDraft' || center.kind === 'categoryDraft';

  return {
    conversations,
    conversationsLoading,
    activeConversationId,
    messages,
    messagesLoading,
    sending,
    center,
    hasPendingProposal,
    errorMessage,
    isTimeoutWarning,
    clearError: () => {
      setErrorMessage(null);
      setIsTimeoutWarning(false);
    },
    selectConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
    confirmProposal,
    cancelProposal,
    openSource,
    exportConversation,
    refreshActiveConversation,
  };
}
