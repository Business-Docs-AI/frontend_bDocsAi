import { ListChecks } from 'lucide-react';
import {
  scrollToDocumentAnchor,
  useDocumentSheetScroll,
} from '@/components/document/documentSheetScroll';
import type { DocumentPlaceholder } from '@/utils/documentHtml';

interface DocumentPendingPointsProps {
  /** Os "[A DEFINIR]" do documento, em ordem (ver `prepareDocumentHtml`). */
  placeholders: DocumentPlaceholder[];
  /**
   * Pendencias estruturadas, quando a origem as fornecer. Hoje a API de
   * proposta/rascunho nao devolve nenhuma, entao a lista sai so dos marcadores.
   */
  items?: string[];
  title?: string;
}

/** Realce temporario do trecho, para o olho achar onde a rolagem parou. */
const FLASH_CLASSES = ['ring-2', 'ring-yellow-500'];
const FLASH_DURATION_MS = 1600;

/**
 * Secao de destaque no topo do corpo: o que ainda precisa ser definido antes de
 * aprovar. Cada item leva ao trecho correspondente dentro da folha.
 */
export function DocumentPendingPoints({
  placeholders,
  items = [],
  title = 'Pontos a definir antes de aprovar',
}: DocumentPendingPointsProps) {
  const scrollRef = useDocumentSheetScroll();

  if (placeholders.length === 0 && items.length === 0) return null;

  function goTo(id: string) {
    const target = scrollToDocumentAnchor(scrollRef?.current, id);
    if (!target) return;

    target.classList.add(...FLASH_CLASSES);
    window.setTimeout(() => target.classList.remove(...FLASH_CLASSES), FLASH_DURATION_MS);
  }

  return (
    <section
      aria-label={title}
      className="mb-7 rounded-lg border border-warning/35 bg-warning/8 px-4 py-3.5"
    >
      <div className="flex items-start gap-2">
        <ListChecks className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-body-sm font-bold text-warning">{title}</p>
          {placeholders.length > 0 && (
            <p className="m-0 mt-0.5 text-xs text-muted-foreground">
              {placeholders.length}{' '}
              {placeholders.length === 1 ? 'trecho marcado' : 'trechos marcados'} como
              [A DEFINIR] — clique para ir até o trecho.
            </p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <ul className="m-0 mt-3 flex list-disc flex-col gap-1 pl-9">
          {items.map((item) => (
            <li key={item} className="m-0 text-body-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      )}

      {placeholders.length > 0 && (
        <ol className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
          {placeholders.map((placeholder, index) => (
            <li key={placeholder.id} className="m-0">
              <button
                type="button"
                onClick={() => goTo(placeholder.id)}
                className="flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-warning/10"
              >
                <span className="shrink-0 text-xs font-bold text-warning">{index + 1}.</span>
                <span className="min-w-0 flex-1">
                  {placeholder.section && (
                    <span className="block text-xs font-semibold text-foreground">
                      {placeholder.section}
                    </span>
                  )}
                  <span className="block text-body-sm break-words text-muted-foreground">
                    {placeholder.context}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
