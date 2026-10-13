import { useState } from 'react';
import axios from 'axios';
import { History, Loader2 } from 'lucide-react';
import { documentsService } from '@/services/api/documentsService';
import { formatDateTime } from '@/pages/Chat/utils';
import type { DocumentVersion } from '@/types';

interface DocumentVersionHistoryProps {
  documentId: string;
}

/**
 * Lista o historico de versoes (GET /documentos/{id}/versoes), carregado so
 * quando o usuario pede. Sem comparacao entre versoes — apenas a lista.
 *
 * O endpoint e restrito a ADMIN/EDITOR; o 403 do leitor comum e tratado como
 * "sem permissao", nao como falha.
 */
export function DocumentVersionHistory({ documentId }: DocumentVersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);

    if (versions || loading) return;

    setLoading(true);
    setError(null);

    try {
      setVersions(await documentsService.listVersions(documentId));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Você não tem permissão para ver o histórico de versões.');
      } else {
        setError('Não foi possível carregar o histórico de versões.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md text-body-sm font-semibold text-primary transition-opacity hover:opacity-80"
      >
        <History className="size-4" />
        Histórico de versões
      </button>

      {open && (
        <div className="mt-3">
          {loading && (
            <p className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando histórico...
            </p>
          )}

          {error && <p className="text-body-sm text-destructive">{error}</p>}

          {versions && versions.length === 0 && (
            <p className="text-body-sm text-muted-foreground">
              Nenhuma versão anterior registrada.
            </p>
          )}

          {versions && versions.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-0 overflow-hidden rounded-lg border border-border p-0">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="m-0 flex flex-col gap-0.5 border-b border-border px-3 py-2.5 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-body-sm font-bold text-foreground">
                      Versão {version.numeroVersao}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {version.autor} · {formatDateTime(version.criadoEm)}
                    </span>
                  </div>
                  {version.comentarioAlteracao && (
                    <p className="m-0 text-body-sm text-muted-foreground">
                      {version.comentarioAlteracao}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
