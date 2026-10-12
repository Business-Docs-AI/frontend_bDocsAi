import { useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentHeading } from '@/utils/documentHtml';

interface DocumentTocProps {
  headings: DocumentHeading[];
  /** Container rolavel onde o documento esta — usado para rolar ate a secao. */
  scrollRef: React.RefObject<HTMLElement | null>;
}

/**
 * Sumario gerado dos titulos h2/h3 do documento.
 * Em telas largas fica fixo na coluna lateral (`sticky`); no mobile vira um
 * bloco recolhido. Nao entra na impressao.
 */
export function DocumentToc({ headings, scrollRef }: DocumentTocProps) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  function goTo(id: string) {
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
    if (!container || !target) return;

    // Rola o container (nao a janela): o documento vive dentro de um painel
    // com rolagem propria.
    const top = target.offsetTop - container.offsetTop - 12;
    container.scrollTo({ top, behavior: 'smooth' });
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

  return (
    <nav aria-label="Sumário" data-print-hide className="print:hidden">
      {/* Mobile: recolhido */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-semibold text-foreground"
        >
          <span className="flex items-center gap-2">
            <List className="size-4 text-muted-foreground" />
            Sumário
          </span>
          <ChevronDown
            className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
          />
        </button>
        {open && (
          <div className="mt-2 rounded-lg border border-border bg-card p-2">{list}</div>
        )}
      </div>

      {/* Telas largas: fixo ao rolar */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <p className="mb-2 px-2 text-[11px] font-bold tracking-[0.4px] text-muted-foreground uppercase">
            Sumário
          </p>
          {list}
        </div>
      </div>
    </nav>
  );
}
