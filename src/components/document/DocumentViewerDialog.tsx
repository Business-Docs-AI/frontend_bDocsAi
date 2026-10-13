import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Titulo do cabecalho fixo do modal. */
  title: string;
  /** A folha: `DocumentSheet`, ou a folha da proposta. */
  children: ReactNode;
}

/**
 * Modal de visualizacao em tela cheia. Usado pela tela de Documentacao e pelo
 * "Abrir em tela cheia" do painel de proposta do Chat — a mesma moldura para os
 * dois, com o cabecalho fixo e a rolagem apenas na folha.
 */
export function DocumentViewerDialog({
  open,
  onOpenChange,
  title,
  children,
}: DocumentViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* O `DialogContent` do shadcn e um grid sem limite de altura: conteudo
       * longo estourava o viewport sem gerar rolagem. `max-h` em `dvh` (que
       * desconta a barra de endereco no mobile) + 2 faixas de grid, com a do
       * meio em `minmax(0,1fr)`, deixam o cabecalho fixo e rola so a folha. */}
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-[min(1180px,calc(100vw-4rem))]">
        <DialogHeader
          data-print-hide
          className="shrink-0 border-b border-border bg-card px-5 py-3 pr-12"
        >
          <DialogTitle className="m-0 truncate text-body font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
