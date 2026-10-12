import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { prepareDocumentHtml, type DocumentHeading } from '@/utils/documentHtml';

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

interface DocumentBodyProps {
  html: string | null | undefined;
  /** Texto exibido quando o documento nao tem conteudo. */
  emptyMessage?: string;
  className?: string;
  /** Recebe os titulos h2/h3 extraidos, para montar o sumario. */
  onHeadings?: (headings: DocumentHeading[]) => void;
}

/**
 * Renderiza o corpo de um documento (HTML vindo do backend) com a tipografia
 * de documento. Usado tanto na visualizacao da Documentacao quanto no painel
 * de proposta do Chat, para os dois ficarem consistentes.
 */
export function DocumentBody({ html, emptyMessage, className }: DocumentBodyProps) {
  const prepared = useMemo(() => prepareDocumentHtml(html), [html]);

  if (!prepared.html) {
    return (
      <p className="text-muted-foreground">
        {emptyMessage ?? 'Este documento não possui conteúdo.'}
      </p>
    );
  }

  return (
    <div
      className={cn(PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: prepared.html }}
    />
  );
}

/**
 * Mesma preparacao usada pelo `DocumentBody`, exposta para quem precisa dos
 * titulos antes de renderizar (a tela monta o sumario ao lado do corpo).
 */
export function useDocumentContent(html: string | null | undefined) {
  return useMemo(() => prepareDocumentHtml(html), [html]);
}

interface PreparedDocumentBodyProps {
  /** HTML ja processado por `useDocumentContent`. */
  html: string;
  className?: string;
}

/** Variante que recebe o HTML ja preparado, evitando processar duas vezes. */
export function PreparedDocumentBody({ html, className }: PreparedDocumentBodyProps) {
  return (
    <div
      className={cn(PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
