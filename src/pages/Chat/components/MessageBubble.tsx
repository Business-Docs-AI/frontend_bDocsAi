import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { renderMarkdownLite } from '@/utils/markdown';
import { formatDateTime } from '@/pages/Chat/utils';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenSource: (documentoId: string) => void;
}

/**
 * `renderMarkdownLite` emite apenas <p>, <ul><li>, <strong> e <em>. Como a bolha
 * fica dentro do escopo `.tw`, o preflight zera a lista e as margens - por isso
 * elas sao redeclaradas aqui.
 */
const CONTENT_CLASSES =
  '[&_p]:m-0 [&_p+p]:mt-2 [&_ul]:m-0 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold';

export function MessageBubble({ message, onOpenSource }: MessageBubbleProps) {
  const isUser = message.papel === 'USER';

  return (
    <div className={cn('flex w-full flex-col', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-3.5 py-[9px]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-border bg-card text-foreground',
        )}
      >
        <div
          className={cn('text-[13.5px] leading-[1.55]', CONTENT_CLASSES)}
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(message.conteudo) }}
        />

        {message.fontes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.fontes.map((fonte) => (
              <button
                key={`${fonte.documentoId}-${fonte.secao}`}
                type="button"
                onClick={() => onOpenSource(fonte.documentoId)}
                className={cn(
                  'inline-flex h-6 max-w-full items-center gap-1 rounded-full px-2 text-[13px] font-semibold transition-opacity hover:opacity-80',
                  isUser ? 'bg-white/[0.18] text-inherit' : 'bg-accent text-accent-foreground',
                )}
              >
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{fonte.titulo}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="mt-[3px] px-1 text-[10.5px] text-muted-foreground/70">
        {formatDateTime(message.criadoEm)}
      </span>
    </div>
  );
}
