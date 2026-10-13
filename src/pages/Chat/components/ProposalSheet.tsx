import { FileClock, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PreparedDocumentBody,
  useDocumentContent,
} from '@/components/document/DocumentBody';
import { DocumentIdentificationBlock } from '@/components/document/DocumentIdentificationBlock';
import { DocumentPendingPoints } from '@/components/document/DocumentPendingPoints';
import {
  DocumentSheetLayout,
  type DocumentSheetVariant,
} from '@/components/document/DocumentSheetLayout';
import {
  DocumentSheetError,
  DocumentSheetSkeleton,
} from '@/components/document/DocumentSheetStates';
import { buildMetaFields } from '@/components/document/documentMeta';
import type { Document, PropostaDocumento } from '@/types';

interface ProposalSheetProps {
  proposta: PropostaDocumento;
  /**
   * Documento que a proposta atualiza, quando a tela conseguiu carrega-lo. A
   * API de proposta devolve so o `documentoIdAlvo` — titulo e versao atual vem
   * daqui (ver `useProposalTarget`). Ausente: o selo mostra a versao sem nome.
   */
  targetDocument?: Document | null;
  variant?: DocumentSheetVariant;
  /** Mostra o "Abrir em tela cheia" (so no painel estreito). */
  onOpenFullScreen?: () => void;
}

const STATUS_SEAL_LABELS: Record<PropostaDocumento['status'], string> = {
  PENDENTE: 'PROPOSTA — aguardando confirmação',
  GERANDO: 'PROPOSTA — gerando documento',
  ERRO_GERACAO: 'PROPOSTA — falha na geração',
};

/**
 * A proposta de documento com a mesma "cara de documento oficial" da tela de
 * Documentacao: reusa a folha, o bloco de identificacao, a tipografia do corpo,
 * o destaque de "[A DEFINIR]" e o sumario.
 *
 * Diferencas em relacao a um documento salvo: o selo ambar de proposta, os
 * metadados limitados ao que o rascunho expoe, a secao "pontos a definir" no
 * topo do corpo e nenhuma impressao/historico de versoes — nada foi salvo
 * ainda. Nao interfere no polling, na confirmacao nem no descarte: isso
 * continua no chat (ver `useChat` e `ChatPanel`).
 */
export function ProposalSheet({
  proposta,
  targetDocument,
  variant = 'page',
  onOpenFullScreen,
}: ProposalSheetProps) {
  const content = useDocumentContent(proposta.conteudoHtml);

  const isUpdate = proposta.tipo === 'ATUALIZAR';
  const isError = proposta.status === 'ERRO_GERACAO';
  const isGenerating = proposta.status === 'GERANDO';

  const fields = buildMetaFields([
    ['Área', proposta.categoriaNome],
    ['Versão atual', isUpdate ? (targetDocument?.versaoAtual ?? null) : null],
    ['Identificador do rascunho', proposta.rascunhoId],
  ]);

  const seal = (
    <div
      role="status"
      className={cn(
        'mb-5 rounded-lg border px-3 py-2.5',
        isError
          ? 'border-destructive/30 bg-destructive/10'
          : 'border-warning/35 bg-warning/10',
      )}
    >
      <p
        className={cn(
          'm-0 flex items-center gap-2 text-body-sm font-bold',
          isError ? 'text-destructive' : 'text-warning',
        )}
      >
        <FileClock className="size-4 shrink-0" />
        {STATUS_SEAL_LABELS[proposta.status]}
      </p>

      {isUpdate && (
        <p className="m-0 mt-1.5 text-body-sm text-foreground">
          {targetDocument ? (
            <>
              Nova versão de: <strong className="font-bold">{targetDocument.titulo}</strong>
              {' · '}
              <span className="text-muted-foreground">
                versão atual {targetDocument.versaoAtual}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              Nova versão de um documento existente.
            </span>
          )}
        </p>
      )}
    </div>
  );

  return (
    <DocumentSheetLayout
      headings={content.headings}
      variant={variant}
      toolbar={
        onOpenFullScreen && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFullScreen}
              className="font-semibold"
            >
              <Maximize2 />
              Abrir em tela cheia
            </Button>
          </div>
        )
      }
    >
      <DocumentIdentificationBlock
        title={proposta.titulo}
        notice={seal}
        fields={fields}
        badge={
          <Badge className="shrink-0 bg-warning/15 font-bold tracking-wide text-warning">
            {isUpdate ? 'Nova versão' : 'Novo documento'}
          </Badge>
        }
      />

      <div className="mt-7">
        {isGenerating && (
          <DocumentSheetSkeleton
            message="Gerando documento..."
            hint="Isso pode levar alguns minutos. O painel se atualiza sozinho quando terminar."
          />
        )}

        {isError && (
          <DocumentSheetError
            title="Não foi possível gerar o documento"
            message={proposta.erroGeracao ?? 'Ocorreu um erro inesperado durante a geração.'}
            hint="Peça para gerar de novo, ou descarte a proposta pelo chat."
          />
        )}

        {!isGenerating && !isError && (
          <>
            <DocumentPendingPoints placeholders={content.placeholders} />

            {content.html ? (
              <PreparedDocumentBody html={content.html} />
            ) : (
              <p className="text-muted-foreground">Esta proposta não possui conteúdo.</p>
            )}
          </>
        )}
      </div>

      <footer className="mt-10 border-t border-border pt-4">
        <p className="m-0 text-xs text-muted-foreground">
          Proposta gerada pela IA — nada é salvo até você confirmar no chat.
        </p>
      </footer>
    </DocumentSheetLayout>
  );
}
