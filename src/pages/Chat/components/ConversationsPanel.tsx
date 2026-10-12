import { useState, type MouseEvent } from 'react';
import { Download, Loader2, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/pages/Chat/utils';
import type { Conversation } from '@/types';

interface ConversationsPanelProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function ConversationsPanel({
  conversations,
  activeConversationId,
  loading,
  onSelect,
  onCreate,
  onDelete,
  onExport,
}: ConversationsPanelProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleDelete(event: MouseEvent, id: string) {
    event.stopPropagation();
    setDeleteTargetId(id);
  }

  function handleCancelDelete() {
    setDeleteTargetId(null);
  }

  function handleConfirmDelete() {
    if (deleteTargetId) onDelete(deleteTargetId);
    setDeleteTargetId(null);
  }

  function handleExport(event: MouseEvent, id: string) {
    event.stopPropagation();
    onExport(id);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Button className="h-10 w-full font-semibold" onClick={onCreate}>
          <Plus />
          Nova conversa
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="size-[22px] animate-spin text-primary" />
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <p className="px-4 text-body-sm text-muted-foreground">Nenhuma conversa ainda.</p>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto">
        {conversations.map((conversation) => {
          const active = conversation.id === activeConversationId;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                'group flex cursor-pointer items-center gap-2.5 border-l-2 px-4 py-[9px]',
                active
                  ? 'border-l-primary bg-accent'
                  : 'border-l-transparent hover:bg-foreground/5',
              )}
            >
              <span
                className={cn(
                  'flex size-[26px] shrink-0 items-center justify-center rounded-md',
                  active ? 'bg-primary/25 text-accent-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                <MessageSquare className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-foreground">
                  {conversation.titulo || 'Conversa sem título'}
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  {formatDateTime(conversation.criadoEm)}
                </p>
              </div>

              <div className="flex shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`Exportar conversa: ${conversation.titulo ?? 'sem título'}`}
                        onClick={(event) => handleExport(event, conversation.id)}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <Download className="size-4" />
                      </button>
                    }
                  />
                  <TooltipContent>Exportar conversa</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`Excluir conversa: ${conversation.titulo ?? 'sem título'}`}
                        onClick={(event) => handleDelete(event, conversation.id)}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    }
                  />
                  <TooltipContent>Excluir conversa</TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="m-0">Excluir conversa?</DialogTitle>
          </DialogHeader>
          <p className="m-0 text-muted-foreground">
            Essa ação não pode ser desfeita. Todas as mensagens e qualquer proposta pendente
            dessa conversa serão apagadas.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelDelete}>
              Não
            </Button>
            <Button
              autoFocus
              onClick={handleConfirmDelete}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
