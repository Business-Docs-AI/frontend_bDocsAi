export type UserRole = 'ADMIN' | 'EDITOR' | 'USUARIO';

export interface AuthUser {
  email: string;
  role: UserRole;
}

/** Shape de GET /users (endpoint restrito a ADMIN). */
export interface AdminUserSummary {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMinutes: number;
}

export interface ApiErrorBody {
  message: string;
  status: number;
}

export type DocumentIndexStatus = 'PENDENTE' | 'INDEXADO' | 'ERRO';

export interface Document {
  id: string;
  titulo: string;
  conteudoHtml: string;
  versaoAtual: number;
  statusIndexacao: DocumentIndexStatus;
  criadoPor: string | null;
  criadoEm: string;
  atualizadoPor: string | null;
  atualizadoEm: string | null;
  categoriaId: number | null;
  categoriaNome: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  documentCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Editor' | 'User';
  status: 'Active' | 'Inactive';
}

export interface Conversation {
  id: string;
  titulo: string | null;
  criadoEm: string;
}

export type MessageRole = 'USER' | 'ASSISTANT';

export interface MessageSource {
  documentoId: string;
  titulo: string;
  secao: string;
  link: string;
}

/** Proposta de criação/atualização de documento pendente de confirmação — lida direto do
 * rascunho no backend (não é texto gerado pela IA), pra renderizar o documento formatado
 * numa área separada do texto da conversa. */
export interface PropostaDocumento {
  rascunhoId: string;
  tipo: 'CRIAR' | 'ATUALIZAR';
  documentoIdAlvo: string | null;
  categoriaId: number | null;
  categoriaNome: string | null;
  titulo: string;
  conteudoHtml: string;
}

export interface PropostaCategoria {
  rascunhoId: number;
  nome: string;
  descricao: string | null;
}

export interface ChatMessage {
  id: string;
  papel: MessageRole;
  conteudo: string;
  fontes: MessageSource[];
  propostaDocumento: PropostaDocumento | null;
  propostaCategoria: PropostaCategoria | null;
  documentoConfirmado: Document | null;
  criadoEm: string;
}

/** GET /chat/conversas/{id}/rascunho-pendente — estado pendente atual da conversa, para
 * restaurar o painel central ao reabrir uma conversa sem precisar reenviar mensagem. */
export interface RascunhoPendente {
  propostaDocumento: PropostaDocumento | null;
  propostaCategoria: PropostaCategoria | null;
}
