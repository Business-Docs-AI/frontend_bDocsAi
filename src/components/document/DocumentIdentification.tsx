import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentIdentificationBlock } from '@/components/document/DocumentIdentificationBlock';
import { buildMetaFields } from '@/components/document/documentMeta';
import {
  CONFIDENTIALITY_LABELS,
  DOCUMENT_TYPE_LABELS,
  LIFECYCLE_STATUS_LABELS,
  formatDateOnly,
  resolveLifecycleStatus,
} from '@/components/document/documentLabels';
import type { Document } from '@/types';

interface DocumentIdentificationProps {
  document: Document;
  /** Nome da categoria quando a tela ja o conhece (fallback do `categoriaNome`). */
  categoryName?: string | null;
}

/**
 * Bloco de identificacao de um documento salvo: monta os metadados de
 * governanca a partir do `DocumentoResponseDTO` e delega a apresentacao ao
 * `DocumentIdentificationBlock` (o mesmo usado pela proposta do Chat).
 */
export function DocumentIdentification({ document, categoryName }: DocumentIdentificationProps) {
  const status = resolveLifecycleStatus(document.statusCicloVida);
  const isObsolete = status === 'OBSOLETO';
  const area = document.categoriaNome ?? categoryName ?? null;

  const fields = buildMetaFields([
    // `id` e o UUID do documento: o backend nao tem um codigo legivel proprio.
    ['Identificador', document.id],
    [
      'Tipo de documento',
      document.tipoDocumento ? DOCUMENT_TYPE_LABELS[document.tipoDocumento] : null,
    ],
    ['Área', area],
    ['Versão', document.versaoAtual],
    ['Vigente desde', formatDateOnly(document.dataVigencia)],
    ['Dono do processo', document.donoProcesso],
    ['Aprovador', document.aprovador],
    ['Próxima revisão', formatDateOnly(document.proximaRevisao)],
    [
      'Periodicidade de revisão',
      document.periodicidadeRevisaoMeses
        ? `${document.periodicidadeRevisaoMeses} ${document.periodicidadeRevisaoMeses === 1 ? 'mês' : 'meses'}`
        : null,
    ],
    [
      'Confidencialidade',
      document.confidencialidade ? CONFIDENTIALITY_LABELS[document.confidencialidade] : null,
    ],
  ]);

  return (
    <DocumentIdentificationBlock
      title={document.titulo}
      tags={document.tags ?? undefined}
      fields={fields}
      notice={
        isObsolete && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive"
          >
            <AlertTriangle className="mt-px size-4 shrink-0" />
            <p className="text-body-sm font-semibold">
              Este documento está obsoleto e não deve ser usado como referência.
            </p>
          </div>
        )
      }
      badge={
        <Badge
          className={cn(
            'shrink-0 font-bold tracking-wide uppercase',
            isObsolete
              ? 'bg-destructive text-primary-foreground'
              : status === 'VIGENTE'
                ? 'bg-success text-primary-foreground'
                : 'bg-warning/15 text-warning',
          )}
        >
          {LIFECYCLE_STATUS_LABELS[status]}
        </Badge>
      }
    />
  );
}
