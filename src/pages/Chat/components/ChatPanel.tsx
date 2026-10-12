import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  AudioLines,
  ChevronRight,
  Loader2,
  Mic,
  Paperclip,
  Send,
  Square,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MessageBubble } from '@/pages/Chat/components/MessageBubble';
import { useAudioRecorder } from '@/pages/Chat/useAudioRecorder';
import type { ChatMessage, PropostaCategoria } from '@/types';

const ATTACHMENT_ACCEPT = '.txt,.md,.html,.htm,.pdf';

/** Equivalente ao `maxRows={5}` do `TextField multiline` do MUI. */
const MAX_INPUT_ROWS = 5;

interface ChatPanelProps {
  messages: ChatMessage[];
  messagesLoading: boolean;
  sending: boolean;
  hasPendingProposal: boolean;
  /** Proposta de categoria pendente (quando existe) — mostrada como um box organizado,
   * já que a criação de categoria não abre o painel central (fica só na conversa). */
  pendingCategoryProposal: PropostaCategoria | null;
  onSend: (pergunta: string, attachments?: { audio?: Blob; anexo?: File }) => Promise<void>;
  onConfirm: () => Promise<void>;
  onCancel: () => Promise<void>;
  onOpenSource: (documentoId: string) => void;
  /**
   * Quando definido, o conteúdo (mensagens + campo de entrada) fica centralizado
   * nessa largura máxima — usado quando o chat ocupa a tela inteira (sem documento
   * aberto ao lado), para parecer um chat de IA comum em vez de uma coluna estreita.
   */
  contentMaxWidth?: number;
}

export function ChatPanel({
  messages,
  messagesLoading,
  sending,
  hasPendingProposal,
  pendingCategoryProposal,
  onSend,
  onConfirm,
  onCancel,
  onOpenSource,
  contentMaxWidth,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [pendingAnexo, setPendingAnexo] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState<'sim' | 'nao' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recorder = useAudioRecorder();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Nova proposta chegando: limpa a seleção visual da proposta anterior.
  useEffect(() => {
    if (hasPendingProposal) setSelectedOption(null);
  }, [hasPendingProposal]);

  // Reproduz o auto-crescimento do `TextField multiline maxRows={5}` do MUI: o campo
  // acompanha o conteúdo até 5 linhas e depois passa a rolar.
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = 'auto';

    const styles = window.getComputedStyle(element);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const vertical =
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom) +
      Number.parseFloat(styles.borderTopWidth) +
      Number.parseFloat(styles.borderBottomWidth);

    const maxHeight = lineHeight * MAX_INPUT_ROWS + vertical;
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
  }, [inputText]);

  const showProposalActions = !sending && hasPendingProposal;

  async function handleSend() {
    const text = inputText.trim();
    const hasAttachment = Boolean(pendingAnexo || recorder.recordedBlob);
    if (!text && !hasAttachment) return;

    setInputText('');
    const anexo = pendingAnexo ?? undefined;
    const audio = recorder.recordedBlob ?? undefined;
    setPendingAnexo(null);
    recorder.reset();

    await onSend(text, { anexo, audio });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPendingAnexo(file);
    event.target.value = '';
  }

  async function handleConfirm() {
    setSelectedOption('sim');
    await onConfirm();
  }

  async function handleCancel() {
    setSelectedOption('nao');
    await onCancel();
  }

  const isFullScreen = Boolean(contentMaxWidth);
  const centeredClasses = contentMaxWidth ? 'mx-auto' : '';
  const centeredStyle = { maxWidth: contentMaxWidth };
  const sendDisabled = sending || (!inputText.trim() && !pendingAnexo && !recorder.recordedBlob);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-4">
        <div className={centeredClasses} style={centeredStyle}>
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-[22px] animate-spin text-primary" />
            </div>
          ) : messages.length === 0 && isFullScreen ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Como posso ajudar hoje?</h1>
              <p className="max-w-[420px] text-body text-muted-foreground">
                Pergunte sobre a documentação existente ou peça para criar um novo documento.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="py-6 text-center text-body-sm text-muted-foreground">
                  Envie uma mensagem para começar a conversa.
                </p>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onOpenSource={onOpenSource} />
              ))}

              {showProposalActions && (
                <div className="flex flex-col items-start gap-2">
                  {pendingCategoryProposal && (
                    <div className="max-w-[88%] rounded-2xl border border-border bg-card px-3.5 py-2.5">
                      <p className="mb-1 text-[11px] font-bold tracking-[0.4px] text-muted-foreground/70 uppercase">
                        Nova categoria proposta
                      </p>
                      <p className="text-body font-bold">{pendingCategoryProposal.nome}</p>
                      {pendingCategoryProposal.descricao && (
                        <p className="mt-1 text-body-sm text-muted-foreground">
                          {pendingCategoryProposal.descricao}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 pl-0.5">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-body-sm font-semibold transition-colors hover:bg-foreground/5',
                        selectedOption === 'sim' ? 'text-success' : 'text-muted-foreground',
                      )}
                    >
                      <ChevronRight className="size-4" />
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-body-sm font-semibold transition-colors hover:bg-foreground/5',
                        selectedOption === 'nao' ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      <ChevronRight className="size-4" />
                      Não
                    </button>
                  </div>
                </div>
              )}

              {sending && (
                <div className="flex items-start">
                  <div className="rounded-2xl border border-border bg-card px-3.5 py-[9px]">
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm text-muted-foreground">Pensando</span>
                      <span className="flex gap-1">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="size-1 animate-thinking-dot rounded-full bg-muted-foreground"
                            style={{ animationDelay: `${dot * 0.18}s` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card p-3">
        <div className={centeredClasses} style={centeredStyle}>
          {(pendingAnexo || recorder.recordedBlob || recorder.isRecording) && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pendingAnexo && (
                <Badge variant="secondary" className="max-w-full gap-1">
                  <span className="truncate">{pendingAnexo.name}</span>
                  <button
                    type="button"
                    aria-label="Remover anexo"
                    onClick={() => setPendingAnexo(null)}
                    className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <X />
                  </button>
                </Badge>
              )}
              {recorder.isRecording && (
                <Badge className="gap-1 bg-destructive text-primary-foreground">
                  <AudioLines />
                  Gravando áudio...
                </Badge>
              )}
              {!recorder.isRecording && recorder.recordedBlob && (
                <Badge variant="secondary" className="gap-1">
                  Áudio gravado
                  <button
                    type="button"
                    aria-label="Descartar áudio gravado"
                    onClick={() => recorder.reset()}
                    className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <X />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {recorder.error && (
            <p className="mb-2 text-xs text-destructive">{recorder.error}</p>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ATTACHMENT_ACCEPT}
              hidden
              onChange={handleFileChange}
            />

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label="Anexar documento"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    <Paperclip className="size-4" />
                  </button>
                }
              />
              <TooltipContent>Anexar documento</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={recorder.isRecording ? 'Parar gravação' : 'Gravar áudio'}
                    onClick={() => (recorder.isRecording ? recorder.stop() : recorder.start())}
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-foreground/5',
                      recorder.isRecording
                        ? 'text-destructive'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {recorder.isRecording ? <Square className="size-4" /> : <Mic className="size-4" />}
                  </button>
                }
              />
              <TooltipContent>
                {recorder.isRecording ? 'Parar gravação' : 'Gravar áudio'}
              </TooltipContent>
            </Tooltip>

            <Textarea
              ref={textareaRef}
              rows={1}
              placeholder="Escreva uma mensagem..."
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-10 flex-1 resize-none py-2"
            />

            <button
              type="button"
              aria-label="Enviar mensagem"
              onClick={handleSend}
              disabled={sendDisabled}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
