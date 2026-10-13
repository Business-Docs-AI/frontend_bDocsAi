import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { prepareDocumentHtml } from '@/utils/documentHtml';

/**
 * Tipografia do corpo do documento, baseada no @tailwindcss/typography.
 *
 * As classes `prose` declaram margens, tamanhos de titulo, marcadores de lista
 * e estilo de tabela por conta propria, sem depender dos defaults do navegador.
 * Foi isso que permitiu ligar o preflight global do Tailwind e aposentar o
 * preflight escopado em `.tw` (ver docs/migracao-tailwind.md).
 */
const PROSE_CLASSES = [
  'prose prose-sm max-w-none break-words',
  // Cores do tema em vez do cinza padrao do plugin.
  'prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground',
  'prose-strong:text-foreground prose-strong:font-bold',
  'prose-a:text-primary prose-a:font-medium',
  'prose-headings:font-bold prose-headings:tracking-tight',
  // Tabelas de RACI/SIPOC: bordas visiveis em todas as celulas e cabecalho destacado.
  'prose-table:w-full prose-table:text-left',
  'prose-th:border prose-th:border-border prose-th:bg-secondary prose-th:px-3 prose-th:py-2',
  'prose-th:align-top prose-th:font-semibold',
  'prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:align-top',
  'prose-img:rounded-lg',
  'prose-pre:bg-secondary prose-pre:text-foreground',
  // Titulos como ancora do sumario: o scroll suave para abaixo do cabecalho fixo.
  'prose-headings:scroll-mt-4',
].join(' ');

/**
 * Prepara o HTML do documento (ids nos titulos, destaque dos "[A DEFINIR]") e
 * devolve tambem os titulos e os marcadores: a folha precisa deles antes de
 * renderizar o corpo, para montar o sumario e os "pontos a definir".
 */
export function useDocumentContent(html: string | null | undefined) {
  return useMemo(() => prepareDocumentHtml(html), [html]);
}

interface PreparedDocumentBodyProps {
  /** HTML ja processado por `useDocumentContent`. */
  html: string;
  className?: string;
}

/**
 * Corpo do documento com a tipografia de documento. Recebe o HTML ja preparado
 * pelo `useDocumentContent`, evitando processar duas vezes. Compartilhado pela
 * visualizacao da Documentacao e pelo painel de proposta do Chat.
 */
export function PreparedDocumentBody({ html, className }: PreparedDocumentBodyProps) {
  return (
    <div
      className={cn(PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
