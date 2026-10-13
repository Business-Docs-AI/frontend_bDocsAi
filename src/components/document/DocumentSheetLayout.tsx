import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DocumentToc } from '@/components/document/DocumentToc';
import { DocumentSheetScrollContext } from '@/components/document/documentSheetScroll';
import type { DocumentHeading } from '@/utils/documentHtml';

/**
 * `page`: folha larga com o sumario numa coluna lateral fixa — visualizacao em
 * tela cheia (modal da Documentacao).
 * `panel`: coluna estreita, sumario recolhivel acima da folha — painel lateral
 * do Chat e as abas do mobile.
 */
export type DocumentSheetVariant = 'page' | 'panel';

interface DocumentSheetLayoutProps {
  /** Titulos do documento, para o sumario. Vazio esconde o sumario. */
  headings?: DocumentHeading[];
  variant?: DocumentSheetVariant;
  /** Barra de acoes acima da folha (nao e impressa). */
  toolbar?: ReactNode;
  /** Conteudo da folha: bloco de identificacao, corpo e rodape. */
  children: ReactNode;
}

/**
 * A "folha": fundo cinza com rolagem propria, sumario e o papel branco
 * centralizado. Compartilhada pela visualizacao de documento e pelo painel de
 * proposta do Chat, para os dois terem exatamente a mesma aparencia.
 *
 * A folha carrega `data-print-root`: o CSS de impressao (global.css) imprime
 * apenas esta subarvore, em A4, sem menus, botoes, sumario nem fundo cinza.
 */
export function DocumentSheetLayout({
  headings = [],
  variant = 'page',
  toolbar,
  children,
}: DocumentSheetLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPanel = variant === 'panel';
  const hasToc = headings.length > 0;

  return (
    <DocumentSheetScrollContext.Provider value={scrollRef}>
      <div
        ref={scrollRef}
        data-doc-scroll
        className={cn(
          'h-full overflow-y-auto bg-background',
          isPanel ? 'px-3 py-4 sm:px-5 sm:py-5' : 'px-4 py-6 md:px-8',
        )}
      >
        <div
          className={cn(
            'mx-auto flex items-start gap-8',
            isPanel ? 'max-w-[820px]' : 'max-w-[1140px]',
          )}
        >
          {!isPanel && hasToc && (
            <aside className="hidden w-56 shrink-0 lg:block">
              <DocumentToc headings={headings} variant="sticky" />
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {toolbar && <div className="mb-3 print:hidden">{toolbar}</div>}

            {hasToc && (
              <DocumentToc
                headings={headings}
                variant="collapsible"
                className={cn('mb-3', !isPanel && 'lg:hidden')}
              />
            )}

            {/* O papel */}
            <article
              data-print-root
              className={cn(
                'mx-auto w-full rounded-lg bg-card shadow-[0_1px_3px_rgba(34,31,28,0.08),0_12px_32px_rgba(34,31,28,0.08)]',
                isPanel
                  ? 'max-w-[760px] px-4 py-6 sm:px-8 sm:py-9'
                  : 'max-w-[800px] px-6 py-8 md:px-14 md:py-12',
              )}
            >
              {children}
            </article>
          </div>
        </div>
      </div>
    </DocumentSheetScrollContext.Provider>
  );
}
