/** Uma entrada do sumario, extraida dos titulos do documento. */
export interface DocumentHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface PreparedDocument {
  /** HTML com ids nos titulos e os "[A DEFINIR]" destacados. */
  html: string;
  headings: DocumentHeading[];
}

/** Marcador de pendencia usado nos documentos gerados. */
const PLACEHOLDER_PATTERN = /\[\s*A\s+DEFINIR\s*\]/gi;

const PLACEHOLDER_CLASS =
  'rounded-sm bg-yellow-100 px-1 font-semibold text-yellow-900 ring-1 ring-yellow-300/70';

function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      // combina com os diacriticos separados pela normalizacao
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'secao'
  );
}

/** Envolve cada "[A DEFINIR]" num <mark>, mexendo so em nos de texto. */
function highlightPlaceholders(root: HTMLElement, doc: globalThis.Document) {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];

  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement?.tagName;
    const skip = parent === 'SCRIPT' || parent === 'STYLE' || parent === 'MARK';

    if (!skip && PLACEHOLDER_PATTERN.test(node.nodeValue ?? '')) {
      targets.push(node as Text);
    }

    PLACEHOLDER_PATTERN.lastIndex = 0;
    node = walker.nextNode();
  }

  for (const textNode of targets) {
    const value = textNode.nodeValue ?? '';
    const fragment = doc.createDocumentFragment();
    let lastIndex = 0;

    PLACEHOLDER_PATTERN.lastIndex = 0;
    let match = PLACEHOLDER_PATTERN.exec(value);

    while (match) {
      if (match.index > lastIndex) {
        fragment.appendChild(doc.createTextNode(value.slice(lastIndex, match.index)));
      }

      const mark = doc.createElement('mark');
      mark.setAttribute('class', PLACEHOLDER_CLASS);
      mark.textContent = match[0];
      fragment.appendChild(mark);

      lastIndex = match.index + match[0].length;
      match = PLACEHOLDER_PATTERN.exec(value);
    }

    if (lastIndex < value.length) {
      fragment.appendChild(doc.createTextNode(value.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }
}

/**
 * Prepara o HTML do documento para exibicao: poe um id estavel em cada h2/h3
 * (ancora do sumario), destaca os "[A DEFINIR]" e devolve a lista de titulos.
 *
 * Nao sanitiza nada: o HTML ja era injetado via `dangerouslySetInnerHTML` antes
 * desta funcao existir, e a confianca na origem (o proprio backend) nao mudou.
 */
export function prepareDocumentHtml(html: string | null | undefined): PreparedDocument {
  if (!html) {
    return { html: '', headings: [] };
  }

  // Sem DOM disponivel (SSR, testes em node): devolve o HTML intacto.
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return { html, headings: [] };
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const body = parsed.body;
  const headings: DocumentHeading[] = [];
  const usedIds = new Set<string>();

  body.querySelectorAll('h2, h3').forEach((element) => {
    const text = (element.textContent ?? '').trim();
    if (!text) return;

    const base = slugify(text);
    let id = base;
    let suffix = 2;

    while (usedIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(id);
    element.setAttribute('id', id);

    headings.push({ id, text, level: element.tagName === 'H2' ? 2 : 3 });
  });

  highlightPlaceholders(body, parsed);

  return { html: body.innerHTML, headings };
}
