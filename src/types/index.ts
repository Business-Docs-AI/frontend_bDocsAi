export type UserRole = 'ADMIN' | 'EDITOR' | 'USUARIO';

export interface AuthUser {
  email: string;
  role: UserRole;
}

/** Espelha `UserDTO` (endpoints de `/users`, restritos a ADMIN). */
export interface AdminUserSummary {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  // Categorias que o usuario pode acessar. ADMIN acessa todas independentemente desta lista.
  categoriaIds: number[];
}

/** Corpo de POST/PUT `/users`. `password` e obrigatoria na criacao; na edicao, deixar
 * vazia/omitida mantem a senha atual (e o que o backend faz ao receber branco/ausente). */
export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  categoriaIds: number[];
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

/** `tipoDocumento` do DocumentoResponseDTO. */
export type DocumentType =
  | 'POLITICA'
  | 'PROCESSO'
  | 'PROCEDIMENTO'
  | 'INSTRUCAO'
  | 'REGISTRO'
  | 'NAO_CLASSIFICADO';

/**
 * `statusCicloVida` do DocumentoResponseDTO — o ciclo de vida do documento,
 * que NAO se confunde com `statusIndexacao` (indexacao para busca).
 * Atencao: `null` significa VIGENTE, espelhando `DocumentoEntity.isVigente()`
 * no backend.
 */
export type DocumentLifecycleStatus =
  | 'EM_ELABORACAO'
  | 'EM_REVISAO'
  | 'VIGENTE'
  | 'OBSOLETO';

/** `confidencialidade` do DocumentoResponseDTO. */
export type DocumentConfidentiality =
  | 'PUBLICO'
  | 'INTERNO'
  | 'CONFIDENCIAL'
  | 'RESTRITO';

/**
 * Espelha `DocumentoResponseDTO`. O backend nao usa `@JsonInclude(NON_NULL)`,
 * logo todas as chaves vem sempre presentes — os campos opcionais chegam como
 * `null`, nao ausentes.
 */
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
  // Metadados de processo/governanca — todos opcionais no backend.
  tipoDocumento: DocumentType | null;
  statusCicloVida: DocumentLifecycleStatus | null;
  donoProcesso: string | null;
  aprovador: string | null;
  /** Data (sem hora): "2026-10-12". */
  dataVigencia: string | null;
  /** Data (sem hora): "2026-10-12". */
  proximaRevisao: string | null;
  periodicidadeRevisaoMeses: number | null;
  confidencialidade: DocumentConfidentiality | null;
  tags: string[] | null;
  // Hierarquia de processo.
  macroprocessoId: number | null;
  processoPaiId: string | null;
}

/**
 * Espelha `DocumentoVersaoResponseDTO` (GET /documentos/{id}/versoes).
 * O endpoint e restrito a ADMIN/EDITOR — um leitor comum recebe 403.
 */
export interface DocumentVersion {
  /** Id da linha de versao, nao do documento. */
  id: string;
  numeroVersao: number;
  titulo: string;
  conteudoHtml: string;
  autor: string;
  criadoEm: string;
  comentarioAlteracao: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
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

/** Geração assíncrona do documento estruturado (Etapa 13) — 'PENDENTE' é o único valor
 * possível para uma proposta do fluxo legado, exatamente como sempre foi; 'GERANDO' e
 * 'ERRO_GERACAO' só aparecem para propostas pedidas pela tool estruturada. */
export type StatusProposta = 'PENDENTE' | 'GERANDO' | 'ERRO_GERACAO';

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
  // null enquanto status === 'GERANDO'.
  conteudoHtml: string | null;
  status: StatusProposta;
  erroGeracao: string | null;
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
