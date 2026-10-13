import { useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  scrollToDocumentAnchor,
  useDocumentSheetScroll,
} from '@/components/document/documentSheetScroll';
import type { DocumentHeading } from '@/utils/documentHtml';

interface DocumentTocProps {
  headings: DocumentHeading[];
  /**
   * `sticky`: lista aberta, fixa na coluna lateral (folha larga).
   * `collapsible`: bloco recolhido que abre ao clique (mobile e painel estreito).
   */
  variant?: 'sticky' | 'collapsible';
  className?: string;
}

/**
 * Sumario gerado dos titulos h2/h3 do documento. Nao entra na impressao.
 *
 * Rola o container publicado pelo `DocumentSheetLayout` (nao a janela): o
 * documento vive dentro de um painel/modal com rolagem propria.
 */
export function DocumentToc({ headings, variant = 'sticky', className }: DocumentTocProps) {
  const scrollRef = useDocumentSheetScroll();
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  function goTo(id: string) {
    scrollToDocumentAnchor(scrollRef?.current, id);
    setOpen(false);
  }

  const list = (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {headings.map((heading) => (
        <li key={heading.id} className="m-0">
          <button
            type="button"
            onClick={() => goTo(heading.id)}
            className={cn(
              'w-full rounded-md px-2 py-1 text-left text-body-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground',
              heading.level === 3 && 'pl-5 text-xs',
            )}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );

  if (variant === 'collapsible') {
    return (
      <nav aria-label="Sumário" data-print-hide className={cn('print:hidden', className)}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-semibold text-foreground"
        >
          <span className="flex items-center gap-2">
            <List className="size-4 text-muted-foreground" />
            Sumário
            <span className="font-normal text-muted-foreground">({headings.length})</span>
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
        {open && <div className="mt-2 rounded-lg border border-border bg-card p-2">{list}</div>}
      </nav>
    );
  }

  return (
    <nav aria-label="Sumário" data-print-hide className={cn('print:hidden', className)}>
      <div className="sticky top-4">
        <p className="mb-2 px-2 text-[11px] font-bold tracking-[0.4px] text-muted-foreground uppercase">
          Sumário
        </p>
        {list}
      </div>
    </nav>
  );
}
