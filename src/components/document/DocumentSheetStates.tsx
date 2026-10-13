import { AlertTriangle, Loader2 } from 'lucide-react';

interface DocumentSheetSkeletonProps {
  /** Mensagem ao lado do indicador de progresso. */
  message?: string;
  /** Texto auxiliar abaixo da mensagem. */
  hint?: string;
}

/**
 * Esqueleto do corpo do documento, para a folha nao "piscar" vazia enquanto o
 * conteudo e gerado. Vai dentro do papel (`DocumentSheetLayout`).
 */
export function DocumentSheetSkeleton({ message, hint }: DocumentSheetSkeletonProps) {
  return (
    <div aria-busy="true">
      {message && (
        <div className="mb-6 flex items-start gap-2 text-muted-foreground">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
          <div className="min-w-0">
            <p className="m-0 text-body-sm font-semibold text-foreground">{message}</p>
            {hint && <p className="m-0 mt-0.5 text-xs text-muted-foreground">{hint}</p>}
          </div>
        </div>
      )}

      <div className="flex animate-pulse flex-col gap-6">
        {[0, 1, 2].map((block) => (
          <div key={block} className="flex flex-col gap-2.5">
            <div className="h-4 w-2/5 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-11/12 rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface DocumentSheetErrorProps {
  title: string;
  message: string;
  hint?: string;
}

/** Mensagem de erro no corpo da folha, no mesmo estilo do documento. */
export function DocumentSheetError({ title, message, hint }: DocumentSheetErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3.5"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0">
        <p className="m-0 text-body-sm font-bold text-destructive">{title}</p>
        <p className="m-0 mt-1 text-body-sm break-words text-foreground">{message}</p>
        {hint && <p className="m-0 mt-2 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
