import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import type { DocumentMetaField } from '@/components/document/documentMeta';

interface DocumentIdentificationBlockProps {
  title: string;
  /** Faixa de aviso acima do titulo (documento obsoleto, selo de proposta...). */
  notice?: ReactNode;
  /** Selo a direita do titulo. */
  badge?: ReactNode;
  tags?: string[];
  fields: DocumentMetaField[];
}

/**
 * Bloco de identificacao no topo da folha: aviso, titulo, selo, tags e a tabela
 * de metadados. So apresenta o que recebe — quem monta a lista decide quais
 * campos existem (ver `buildMetaFields`), entao documento e proposta usam o
 * mesmo bloco com conteudos diferentes.
 */
export function DocumentIdentificationBlock({
  title,
  notice,
  badge,
  tags,
  fields,
}: DocumentIdentificationBlockProps) {
  const visibleTags = tags?.filter((tag) => tag && tag.trim()) ?? [];

  return (
    <header>
      {notice}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="m-0 flex-1 text-2xl leading-tight font-bold text-foreground">{title}</h1>
        {badge}
      </div>

      {visibleTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
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
