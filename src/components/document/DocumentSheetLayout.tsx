import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DocumentToc } from '@/components/document/DocumentToc';
import { DocumentSheetScrollContext } from '@/components/document/documentSheetScroll';
import type { DocumentHeading } from '@/utils/documentHtml';

/**
 * `page`: folha larga, usada na visualizacao em tela cheia (modal da
 * Documentacao). `panel`: folha mais estreita, usada no painel lateral do
 * Chat e nas abas do mobile.
 *
 * As duas colocam o sumario do lado do documento sempre que a largura
 * disponivel permitir — so recolhe acima da folha quando nao cabe (ver o
 * `@container` abaixo). A diferenca entre as variantes e so o tamanho da
 * folha e das margens, nao mais a posicao do sumario.
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
          // `@container`: o sumario vira coluna lateral ou recolhe pra cima da
          // folha de acordo com a largura REAL deste painel — nao a da janela.
          // E o que faz o painel estreito do Chat (que nao controla o tamanho
          // da janela) se comportar como o modal largo quando tem espaco.
          '@container h-full overflow-y-auto bg-background',
          isPanel ? 'px-3 py-4 sm:px-5 sm:py-5' : 'px-4 py-6 md:px-8',
        )}
      >
        <div
          className={cn(
            'mx-auto flex items-start',
            isPanel ? 'max-w-[820px] gap-6' : 'max-w-[1140px] gap-8',
          )}
        >
          {hasToc && (
            <aside
              className={cn(
                'hidden shrink-0 @3xl:block',
                isPanel ? 'w-44' : 'w-56',
              )}
            >
              <DocumentToc headings={headings} variant="sticky" />
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {toolbar && <div className="mb-3 print:hidden">{toolbar}</div>}

            {hasToc && (
              <DocumentToc headings={headings} variant="collapsible" className="mb-3 @3xl:hidden" />
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
