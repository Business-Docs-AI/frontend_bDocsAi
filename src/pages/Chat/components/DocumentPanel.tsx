import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { DocumentSheet } from '@/components/document/DocumentSheet';
import { DocumentViewerDialog } from '@/components/document/DocumentViewerDialog';
import { ProposalSheet } from '@/pages/Chat/components/ProposalSheet';
import { useProposalTarget } from '@/pages/Chat/useProposalTarget';
import type { CenterContent } from '@/pages/Chat/useChat';
import type { PropostaDocumento } from '@/types';

interface DocumentPanelProps {
  content: CenterContent;
}

export function DocumentPanel({ content }: DocumentPanelProps) {
  if (content.kind === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-[26px] animate-spin text-primary" />
      </div>
    );
  }

  if (content.kind === 'empty') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <FileText className="size-10 text-muted-foreground/70" strokeWidth={1.5} />
        <p className="max-w-[360px] text-muted-foreground">
          Nenhum documento selecionado — converse com a IA ao lado para criar ou abrir um.
        </p>
      </div>
    );
  }

  if (content.kind === 'documentDraft') {
    return <ProposalPanel proposta={content.proposta} />;
  }

  if (content.kind === 'categoryDraft') {
    // ChatPage só monta este painel para 'documentDraft' e 'document' — a proposta de
    // categoria é resolvida só pelo chat (ver ChatPanel). Guarda defensiva, não deve ocorrer.
    return null;
  }

  return <DocumentSheet document={content.document} variant="panel" />;
}

interface ProposalPanelProps {
  proposta: PropostaDocumento;
}

/**
 * A proposta no painel: a folha estreita, mais o "Abrir em tela cheia", que
 * reaproveita o modal de visualizacao da tela de Documentacao (mesma moldura,
 * mesma folha — so com o selo de PROPOSTA e sem botao de imprimir).
 *
 * Os estados GERANDO e ERRO_GERACAO tambem sao desenhados na folha, pelo
 * proprio `ProposalSheet`. O polling, a confirmacao e o descarte continuam no
 * chat (`useChat`/`ChatPanel`) — nada aqui mexe nisso.
 */
function ProposalPanel({ proposta }: ProposalPanelProps) {
  const [fullScreen, setFullScreen] = useState(false);
  const targetDocument = useProposalTarget(
    proposta.tipo === 'ATUALIZAR' ? proposta.documentoIdAlvo : null,
  );

  // Sem conteudo (gerando ou erro) nao ha nada para ver em tela cheia.
  const canOpenFullScreen = proposta.status === 'PENDENTE' && Boolean(proposta.conteudoHtml);

  return (
    <>
      <ProposalSheet
        proposta={proposta}
        targetDocument={targetDocument}
        variant="panel"
        onOpenFullScreen={canOpenFullScreen ? () => setFullScreen(true) : undefined}
      />

      <DocumentViewerDialog
        open={fullScreen}
        onOpenChange={setFullScreen}
        title={proposta.titulo}
      >
        {fullScreen && (
          <ProposalSheet proposta={proposta} targetDocument={targetDocument} variant="page" />
        )}
      </DocumentViewerDialog>
    </>
  );
}
