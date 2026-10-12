import { FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentBody } from '@/components/document/DocumentBody';
import { formatDateTime } from '@/pages/Chat/utils';
import type { CenterContent } from '@/pages/Chat/useChat';

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
    const { proposta } = content;

    // Etapa 13.6: geração assíncrona em andamento — sem conteúdo ainda, mostra só um
    // indicador. O polling (useChat) atualiza este painel sozinho quando terminar.
    if (proposta.status === 'GERANDO') {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Gerando o documento estruturado{proposta.titulo ? ` "${proposta.titulo}"` : ''}... isso pode levar
            alguns minutos.
          </p>
        </div>
      );
    }

    if (proposta.status === 'ERRO_GERACAO') {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="font-bold text-destructive">Não foi possível gerar o documento</p>
          <p className="max-w-[420px] text-muted-foreground">
            {proposta.erroGeracao ?? 'Ocorreu um erro inesperado durante a geração.'}
          </p>
          <p className="text-body-sm text-muted-foreground">
            Peça para gerar de novo, ou descarte a proposta pelo chat.
          </p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto p-5 md:p-8">
        <Badge className="mb-4 bg-warning/10 font-bold text-warning">
          {proposta.tipo === 'CRIAR'
            ? 'Novo documento — aguardando confirmação'
            : 'Atualização — aguardando confirmação'}
        </Badge>
        <div className="mb-4 flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold">{proposta.titulo}</h1>
          {proposta.categoriaNome && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{proposta.categoriaNome}</Badge>
            </div>
          )}
        </div>
        <hr className="mb-5 border-t border-border" />
        <DocumentBody
          html={proposta.conteudoHtml}
          emptyMessage="Esta proposta não possui conteúdo."
        />
      </div>
    );
  }

  if (content.kind === 'categoryDraft') {
    // ChatPage só monta este painel para 'documentDraft' e 'document' — a proposta de
    // categoria é resolvida só pelo chat (ver ChatPanel). Guarda defensiva, não deve ocorrer.
    return null;
  }

  const { document } = content;

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8">
      <div className="mb-4 flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold">{document.titulo}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {document.categoriaNome && <Badge variant="secondary">{document.categoriaNome}</Badge>}
          <Badge variant="outline">Versão {document.versaoAtual}</Badge>
          <span className="text-xs text-muted-foreground">
            {document.criadoPor ?? 'Autor não informado'} · {formatDateTime(document.criadoEm)}
          </span>
        </div>
      </div>
      <hr className="mb-5 border-t border-border" />
      <DocumentBody html={document.conteudoHtml} />
    </div>
  );
}
