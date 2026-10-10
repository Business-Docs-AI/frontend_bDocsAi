import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { MessageBubble } from '@/pages/Chat/components/MessageBubble';
import { useAudioRecorder } from '@/pages/Chat/useAudioRecorder';
import type { ChatMessage, PropostaCategoria } from '@/types';

const ATTACHMENT_ACCEPT = '.txt,.md,.html,.htm,.pdf';

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
  const recorder = useAudioRecorder();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Nova proposta chegando: limpa a seleção visual da proposta anterior.
  useEffect(() => {
    if (hasPendingProposal) setSelectedOption(null);
  }, [hasPendingProposal]);

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

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Box sx={{ maxWidth: contentMaxWidth, mx: contentMaxWidth ? 'auto' : 0 }}>
          {messagesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={22} />
            </Box>
          ) : messages.length === 0 && isFullScreen ? (
            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: '50vh', textAlign: 'center' }}>
              <Typography variant="h1" sx={{ fontSize: 24 }}>
                Como posso ajudar hoje?
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14, maxWidth: 420 }}>
                Pergunte sobre a documentação existente ou peça para criar um novo documento.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {messages.length === 0 && (
                <Typography color="text.secondary" sx={{ fontSize: 13, textAlign: 'center', py: 3 }}>
                  Envie uma mensagem para começar a conversa.
                </Typography>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onOpenSource={onOpenSource} />
              ))}
              {showProposalActions && (
                <Stack alignItems="flex-start" spacing={1}>
                  {pendingCategoryProposal && (
                    <Box
                      sx={{
                        maxWidth: '88%',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        px: 1.75,
                        py: 1.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'text.disabled',
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                          mb: 0.5,
                        }}
                      >
                        Nova categoria proposta
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{pendingCategoryProposal.nome}</Typography>
                      {pendingCategoryProposal.descricao && (
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                          {pendingCategoryProposal.descricao}
                        </Typography>
                      )}
                    </Box>
                  )}
                  <Stack spacing={0.25} sx={{ pl: 0.25 }}>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                      onClick={handleConfirm}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 1,
                        minWidth: 0,
                        color: selectedOption === 'sim' ? 'success.main' : 'text.secondary',
                        '& .MuiButton-startIcon': { mr: 0.25 },
                      }}
                    >
                      Sim
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                      onClick={handleCancel}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 1,
                        minWidth: 0,
                        color: selectedOption === 'nao' ? 'error.main' : 'text.secondary',
                        '& .MuiButton-startIcon': { mr: 0.25 },
                      }}
                    >
                      Não
                    </Button>
                  </Stack>
                </Stack>
              )}
              {sending && (
                <Stack alignItems="flex-start">
                  <Box
                    sx={{
                      borderRadius: 2,
                      px: 1.75,
                      py: 1.1,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={0.9} alignItems="center">
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Pensando</Typography>
                      <Stack direction="row" spacing={0.4}>
                        {[0, 1, 2].map((dot) => (
                          <Box
                            key={dot}
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: 'text.secondary',
                              animation: 'chat-thinking-dot 1.1s infinite ease-in-out',
                              animationDelay: `${dot * 0.18}s`,
                              '@keyframes chat-thinking-dot': {
                                '0%, 80%, 100%': { opacity: 0.25, transform: 'scale(0.85)' },
                                '40%': { opacity: 1, transform: 'scale(1)' },
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              )}
              <div ref={bottomRef} />
            </Stack>
          )}
        </Box>
      </Box>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5, bgcolor: 'background.paper' }}>
        <Box sx={{ maxWidth: contentMaxWidth, mx: contentMaxWidth ? 'auto' : 0 }}>
          {(pendingAnexo || recorder.recordedBlob || recorder.isRecording) && (
            <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
              {pendingAnexo && (
                <Chip
                  size="small"
                  label={pendingAnexo.name}
                  onDelete={() => setPendingAnexo(null)}
                />
              )}
              {recorder.isRecording && (
                <Chip
                  size="small"
                  color="error"
                  icon={<GraphicEqIcon sx={{ fontSize: 14 }} />}
                  label="Gravando áudio..."
                />
              )}
              {!recorder.isRecording && recorder.recordedBlob && (
                <Chip size="small" label="Áudio gravado" onDelete={() => recorder.reset()} />
              )}
            </Stack>
          )}

          {recorder.error && (
            <Typography sx={{ fontSize: 12, color: 'error.main', mb: 1 }}>{recorder.error}</Typography>
          )}

          <Stack direction="row" spacing={1} alignItems="flex-end">
            <input
              ref={fileInputRef}
              type="file"
              accept={ATTACHMENT_ACCEPT}
              hidden
              onChange={handleFileChange}
            />
            <Tooltip title="Anexar documento">
              <IconButton onClick={() => fileInputRef.current?.click()} size="small">
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={recorder.isRecording ? 'Parar gravação' : 'Gravar áudio'}>
              <IconButton
                onClick={() => (recorder.isRecording ? recorder.stop() : recorder.start())}
                size="small"
                color={recorder.isRecording ? 'error' : 'default'}
              >
                {recorder.isRecording ? <StopIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <TextField
              fullWidth
              multiline
              maxRows={5}
              size="small"
              placeholder="Escreva uma mensagem..."
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={handleKeyDown}
            />

            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={sending || (!inputText.trim() && !pendingAnexo && !recorder.recordedBlob)}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
