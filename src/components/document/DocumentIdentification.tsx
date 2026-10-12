import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

interface MetaField {
  label: string;
  value: string;
}

/**
 * Bloco de identificacao no topo da folha: titulo, selo de status e a tabela de
 * metadados de governanca. Campo nulo ou vazio simplesmente nao entra na lista
 * — nunca aparece rotulo sem valor nem "undefined".
 */
export function DocumentIdentification({ document, categoryName }: DocumentIdentificationProps) {
  const status = resolveLifecycleStatus(document.statusCicloVida);
  const isObsolete = status === 'OBSOLETO';
  const area = document.categoriaNome ?? categoryName ?? null;

  const fields: MetaField[] = [];

  function push(label: string, value: string | null | undefined) {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    if (trimmed) fields.push({ label, value: trimmed });
  }

  // `id` e o UUID do documento: o backend nao tem um codigo legivel proprio.
  push('Identificador', document.id);
  push(
    'Tipo de documento',
    document.tipoDocumento ? DOCUMENT_TYPE_LABELS[document.tipoDocumento] : null,
  );
  push('Área', area);
  push('Versão', String(document.versaoAtual));
  push('Vigente desde', formatDateOnly(document.dataVigencia));
  push('Dono do processo', document.donoProcesso);
  push('Aprovador', document.aprovador);
  push('Próxima revisão', formatDateOnly(document.proximaRevisao));
  push(
    'Periodicidade de revisão',
    document.periodicidadeRevisaoMeses
      ? `${document.periodicidadeRevisaoMeses} ${document.periodicidadeRevisaoMeses === 1 ? 'mês' : 'meses'}`
      : null,
  );
  push(
    'Confidencialidade',
    document.confidencialidade ? CONFIDENTIALITY_LABELS[document.confidencialidade] : null,
  );

  const tags = document.tags?.filter((tag) => tag && tag.trim()) ?? [];

  return (
    <header>
      {isObsolete && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive"
        >
          <AlertTriangle className="mt-px size-4 shrink-0" />
          <p className="text-body-sm font-semibold">
            Este documento está obsoleto e não deve ser usado como referência.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="m-0 flex-1 text-2xl leading-tight font-bold text-foreground">
          {document.titulo}
        </h1>
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
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-medium">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 border-y border-border py-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-bold tracking-[0.4px] text-muted-foreground uppercase">
                {field.label}
              </dt>
              <dd className="m-0 text-body-sm break-words text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
