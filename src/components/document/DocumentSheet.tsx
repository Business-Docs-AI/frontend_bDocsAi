import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PreparedDocumentBody,
  useDocumentContent,
} from '@/components/document/DocumentBody';
import { DocumentIdentification } from '@/components/document/DocumentIdentification';
import {
  DocumentSheetLayout,
  type DocumentSheetVariant,
} from '@/components/document/DocumentSheetLayout';
import { DocumentVersionHistory } from '@/components/document/DocumentVersionHistory';
import { formatDateTime } from '@/pages/Chat/utils';
import type { Document } from '@/types';

interface DocumentSheetProps {
  document: Document;
  /** Nome da categoria quando a tela ja o conhece. */
  categoryName?: string | null;
  /** `panel` estreita a folha e recolhe o sumario (painel do Chat). */
  variant?: DocumentSheetVariant;
}

/**
 * Visualizacao de um documento salvo com "cara de documento oficial", sobre a
 * folha compartilhada (`DocumentSheetLayout`): bloco de identificacao, corpo
 * com a tipografia de documento, sumario e rodape de controle.
 */
export function DocumentSheet({
  document,
  categoryName,
  variant = 'page',
}: DocumentSheetProps) {
  const content = useDocumentContent(document.conteudoHtml);

  const lastUpdateAuthor = document.atualizadoPor ?? document.criadoPor;
  const lastUpdateDate = document.atualizadoEm ?? document.criadoEm;

  return (
    <DocumentSheetLayout headings={content.headings} variant={variant}>
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
    </DocumentSheetLayout>
  );
}
