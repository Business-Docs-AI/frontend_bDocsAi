import { createContext, useContext, type RefObject } from 'react';

/**
 * Container rolavel da folha do documento, publicado pelo `DocumentSheetLayout`.
 *
 * O documento nunca rola a janela: ele vive dentro de um painel (ou de um modal)
 * com rolagem propria. Quem precisa levar o usuario ate um trecho — o sumario e
 * a lista de "pontos a definir" — pega este container do contexto em vez de
 * receber uma ref por prop em cada nivel.
 */
export const DocumentSheetScrollContext = createContext<RefObject<HTMLElement | null> | null>(
  null,
);

export function useDocumentSheetScroll() {
  return useContext(DocumentSheetScrollContext);
}

/** Folga entre o topo do container e o trecho de destino. */
const SCROLL_OFFSET = 16;

/** Janela para conferir se o scroll suave realmente comecou. */
const SMOOTH_FALLBACK_MS = 150;

/**
 * Rola o container ate o elemento de id `id`. Usa retangulos em vez de
 * `offsetTop` para funcionar com qualquer ancora — inclusive uma `<mark>`
 * inline no meio de um paragrafo.
 */
export function scrollToDocumentAnchor(
  container: HTMLElement | null | undefined,
  id: string,
): HTMLElement | null {
  const target = container?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  if (!container || !target) return null;

  const from = container.scrollTop;
  const top = Math.max(
    0,
    from + target.getBoundingClientRect().top - container.getBoundingClientRect().top - SCROLL_OFFSET,
  );

  container.scrollTo({ top, behavior: 'smooth' });

  // Com o "smooth scrolling" do navegador desligado, o `scrollTo` suave e
  // simplesmente ignorado e o usuario ficaria sem sair do lugar. Se nada se
  // mexeu, rola direto.
  window.setTimeout(() => {
    if (container.scrollTop === from) container.scrollTop = top;
  }, SMOOTH_FALLBACK_MS);

  return target;
}
