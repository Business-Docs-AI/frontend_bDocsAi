import { FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/pages/Chat/utils';
import type { CenterContent } from '@/pages/Chat/useChat';

interface DocumentPanelProps {
  content: CenterContent;
}

/**
 * Estilos do conteudo HTML vindo do backend (equivalente ao antigo `proseStyles`).
 * O painel fica dentro do escopo `.tw`, onde o preflight zera margens, tamanho de
 * titulo e marcadores de lista - por isso tudo e redeclarado aqui, inclusive os
 * tamanhos de <h1>/<h2>/<h3>, que antes vinham dos defaults do navegador.
 */
const PROSE_CLASSES = [
  'break-words',
  '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-[2em] [&_h1]:font-bold [&_h1:first-of-type]:mt-0',
  '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-[1.5em] [&_h2]:font-bold [&_h2:first-of-type]:mt-0',
  '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[1.17em] [&_h3]:font-bold [&_h3:first-of-type]:mt-0',
  '[&_p]:mb-2.5 [&_p]:leading-[1.65]',
  '[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-1',
  '[&_img]:max-w-full [&_img]:rounded-lg',
  '[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse',
  '[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1',
  '[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1',
  '[&_a]:text-primary',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-background [&_pre]:p-3',
  '[&_strong]:font-bold',
].join(' ');

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
        <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: proposta.conteudoHtml ?? '' }} />
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
      <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: document.conteudoHtml }} />
    </div>
  );
}
