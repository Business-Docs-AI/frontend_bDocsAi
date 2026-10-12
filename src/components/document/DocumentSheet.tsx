import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PreparedDocumentBody,
  useDocumentContent,
} from '@/components/document/DocumentBody';
import { DocumentIdentification } from '@/components/document/DocumentIdentification';
import { DocumentToc } from '@/components/document/DocumentToc';
import { DocumentVersionHistory } from '@/components/document/DocumentVersionHistory';
import { formatDateTime } from '@/pages/Chat/utils';
import type { Document } from '@/types';

interface DocumentSheetProps {
  document: Document;
  /** Nome da categoria quando a tela ja o conhece. */
  categoryName?: string | null;
}

/**
 * Visualizacao de documento com "cara de documento oficial": folha branca
 * centralizada sobre fundo cinza, sumario lateral e rodape de controle.
 *
 * A folha carrega `data-print-root`: o CSS de impressao (global.css) imprime
 * apenas esta subarvore, em A4, sem menus, botoes, sumario nem fundo cinza.
 */
export function DocumentSheet({ document, categoryName }: DocumentSheetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const content = useDocumentContent(document.conteudoHtml);

  const lastUpdateAuthor = document.atualizadoPor ?? document.criadoPor;
  const lastUpdateDate = document.atualizadoEm ?? document.criadoEm;

  return (
    <div
      ref={scrollRef}
      data-doc-scroll
      className="h-full overflow-y-auto bg-background px-4 py-6 md:px-8"
    >
      <div className="mx-auto flex max-w-[1140px] items-start gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <DocumentToc headings={content.headings} scrollRef={scrollRef} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <DocumentToc headings={content.headings} scrollRef={scrollRef} />
          </div>

          {/* A folha */}
          <article
            data-print-root
            className="mx-auto w-full max-w-[800px] rounded-lg bg-card px-6 py-8 shadow-[0_1px_3px_rgba(34,31,28,0.08),0_12px_32px_rgba(34,31,28,0.08)] md:px-14 md:py-12"
          >
            <DocumentIdentification document={document} categoryName={categoryName} />

            <div className="mt-7">
              {content.html ? (
                <PreparedDocumentBody html={content.html} />
              ) : (
                <p className="text-muted-foreground">Este documento não possui conteúdo.</p>
              )}
            </div>

            <footer className="mt-10 border-t border-border pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 text-xs text-muted-foreground">
                  Versão {document.versaoAtual}
                  {lastUpdateAuthor ? ` · ${lastUpdateAuthor}` : ''}
                  {lastUpdateDate
                    ? ` · última atualização em ${formatDateTime(lastUpdateDate)}`
                    : ''}
                </p>

                <div className="flex items-center gap-4 print:hidden">
                  <DocumentVersionHistory documentId={document.id} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="shrink-0 font-semibold"
                  >
                    <Printer />
                    Imprimir / PDF
                  </Button>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
