import { httpClient } from '@/services/api/httpClient';
import type { ChatMessage, Conversation, RascunhoPendente } from '@/types';

export interface SendMessageAttachments {
  pergunta?: string;
  audio?: File | Blob;
  anexo?: File;
}

/**
 * O backend encadeia várias chamadas de IA (raciocínio + ferramentas) antes de responder
 * a uma mensagem de chat — isso pode legitimamente levar 10-40s+, bem mais que o timeout
 * padrão do httpClient. Só a rota de envio de mensagem usa esse timeout maior.
 */
const SEND_MESSAGE_TIMEOUT_MS = 60000;

/**
 * Serviço de chat. Mensagens com texto puro usam JSON; mensagens com áudio
 * e/ou anexo usam multipart/form-data (ver POST /chat/conversas/{id}/mensagens).
 */
export const chatService = {
  async listConversations(): Promise<Conversation[]> {
    const { data } = await httpClient.get<Conversation[]>('/chat/conversas');
    return data;
  },

  async createConversation(titulo?: string): Promise<Conversation> {
    const { data } = await httpClient.post<Conversation>('/chat/conversas', { titulo: titulo || null });
    return data;
  },

  async deleteConversation(id: string): Promise<void> {
    await httpClient.delete(`/chat/conversas/${id}`);
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await httpClient.get<ChatMessage[]>(`/chat/conversas/${conversationId}`);
    return data;
  },

  /** Estado pendente atual da conversa (documento e/ou categoria aguardando confirmação),
   * lido direto do backend — nunca derivado do texto das mensagens. */
  async getPendingDraft(conversationId: string): Promise<RascunhoPendente> {
    const { data } = await httpClient.get<RascunhoPendente>(
      `/chat/conversas/${conversationId}/rascunho-pendente`,
    );
    return data;
  },

  async exportConversation(conversationId: string): Promise<string> {
    const { data } = await httpClient.get<string>(`/chat/conversas/${conversationId}/exportar`, {
      responseType: 'text',
    });
    return data;
  },

  async sendMessage(conversationId: string, pergunta: string): Promise<ChatMessage> {
    const { data } = await httpClient.post<ChatMessage>(
      `/chat/conversas/${conversationId}/mensagens`,
      { pergunta },
      { timeout: SEND_MESSAGE_TIMEOUT_MS },
    );
    return data;
  },

  async sendMessageWithAttachments(
    conversationId: string,
    { pergunta, audio, anexo }: SendMessageAttachments,
  ): Promise<ChatMessage> {
    const formData = new FormData();
    if (pergunta) formData.append('pergunta', pergunta);
    if (audio) formData.append('audio', audio, audio instanceof File ? audio.name : 'audio.webm');
    if (anexo) formData.append('anexo', anexo);

    // Não definir Content-Type manualmente: o axios/browser cuida do boundary do multipart.
    const { data } = await httpClient.post<ChatMessage>(
      `/chat/conversas/${conversationId}/mensagens`,
      formData,
      { timeout: SEND_MESSAGE_TIMEOUT_MS },
    );
    return data;
  },
};
