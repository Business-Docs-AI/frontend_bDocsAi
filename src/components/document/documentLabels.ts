import type {
  DocumentConfidentiality,
  DocumentLifecycleStatus,
  DocumentType,
} from '@/types';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  POLITICA: 'Política',
  PROCESSO: 'Processo',
  PROCEDIMENTO: 'Procedimento',
  INSTRUCAO: 'Instrução de trabalho',
  REGISTRO: 'Registro',
  NAO_CLASSIFICADO: 'Não classificado',
};

export const LIFECYCLE_STATUS_LABELS: Record<DocumentLifecycleStatus, string> = {
  EM_ELABORACAO: 'Em elaboração',
  EM_REVISAO: 'Em revisão',
  VIGENTE: 'Vigente',
  OBSOLETO: 'Obsoleto',
};

export const CONFIDENTIALITY_LABELS: Record<DocumentConfidentiality, string> = {
  PUBLICO: 'Público',
  INTERNO: 'Interno',
  CONFIDENCIAL: 'Confidencial',
  RESTRITO: 'Restrito',
};

/**
 * `null` em `statusCicloVida` significa vigente, espelhando
 * `DocumentoEntity.isVigente()` no backend.
 */
export function resolveLifecycleStatus(
  status: DocumentLifecycleStatus | null,
): DocumentLifecycleStatus {
  return status ?? 'VIGENTE';
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Formata uma data sem hora ("2026-10-12") sem deslocar por fuso. */
export function formatDateOnly(value: string | null): string | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  // Construir com numeros evita o parse UTC de "YYYY-MM-DD", que no Brasil
  // mostraria o dia anterior.
  return dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)));
}
