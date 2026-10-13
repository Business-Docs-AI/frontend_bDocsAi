/** Uma entrada do sumario, extraida dos titulos do documento. */
export interface DocumentHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Um "[A DEFINIR]" encontrado no documento, com ancora e contexto. */
export interface DocumentPlaceholder {
  /** Id da `<mark>` no HTML preparado — ancora para rolar ate o trecho. */
  id: string;
  /** Titulo (h2/h3) em que o trecho esta, quando houver. */
  section: string | null;
  /** Texto em volta do marcador, para o usuario reconhecer o ponto. */
  context: string;
}

export interface PreparedDocument {
  /** HTML com ids nos titulos e os "[A DEFINIR]" destacados. */
  html: string;
  headings: DocumentHeading[];
  /** Os "[A DEFINIR]" na ordem em que aparecem no documento. */
  placeholders: DocumentPlaceholder[];
}

/** Marcador de pendencia usado nos documentos gerados. */
const PLACEHOLDER_PATTERN = /\[\s*A\s+DEFINIR\s*\]/gi;

const PLACEHOLDER_CLASS =
  'rounded-sm bg-yellow-100 px-1 font-semibold text-yellow-900 ring-1 ring-yellow-300/70';

/** Prefixo do id de cada marcador — a ancora usada pelos "pontos a definir". */
const PLACEHOLDER_ID_PREFIX = 'a-definir';

/** Blocos considerados "a frase em volta" do marcador. */
const CONTEXT_BLOCKS = 'p,li,td,th,h1,h2,h3,h4,h5,h6,blockquote,figcaption,dt,dd';
const CONTEXT_MAX_LENGTH = 160;
const CONTEXT_SIDE_LENGTH = 70;

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

/** Garante um id unico no documento, sufixando quando ja existir. */
function uniqueId(base: string, usedIds: Set<string>): string {
  let id = base;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Texto em volta do marcador: o bloco em que ele esta, recortado em volta do
 * "[A DEFINIR]" quando o bloco e longo demais para caber na lista.
 */
function contextOf(mark: HTMLElement): string {
  const block = mark.closest(CONTEXT_BLOCKS) ?? mark.parentElement;
  const text = normalizeSpaces(block?.textContent ?? mark.textContent ?? '');
  const marker = normalizeSpaces(mark.textContent ?? '');

  if (text.length <= CONTEXT_MAX_LENGTH) return text;

  const at = text.indexOf(marker);
  if (at < 0) return `${text.slice(0, CONTEXT_MAX_LENGTH)}…`;

  const start = Math.max(0, at - CONTEXT_SIDE_LENGTH);
  const end = Math.min(text.length, at + marker.length + CONTEXT_SIDE_LENGTH);

  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

/**
 * Lista os marcadores na ordem do documento, anotando o titulo em que cada um
 * esta. `querySelectorAll` devolve em ordem de documento, logo basta percorrer
 * titulos e marcadores juntos guardando o ultimo titulo visto.
 */
function collectPlaceholders(root: HTMLElement): DocumentPlaceholder[] {
  const placeholders: DocumentPlaceholder[] = [];
  let section: string | null = null;

  root.querySelectorAll<HTMLElement>('h2, h3, mark[data-placeholder]').forEach((element) => {
    if (element.tagName === 'MARK') {
      placeholders.push({ id: element.id, section, context: contextOf(element) });
      return;
    }

    section = normalizeSpaces(element.textContent ?? '') || section;
  });

  return placeholders;
}

/** Envolve cada "[A DEFINIR]" num <mark>, mexendo so em nos de texto. */
function highlightPlaceholders(
  root: HTMLElement,
  doc: globalThis.Document,
  usedIds: Set<string>,
) {
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
      // Ancora dos "pontos a definir": o painel de proposta rola ate ela.
      mark.setAttribute('id', uniqueId(PLACEHOLDER_ID_PREFIX, usedIds));
      mark.setAttribute('data-placeholder', '');
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
 * (ancora do sumario), destaca os "[A DEFINIR]" (cada um tambem com id, ancora
 * dos "pontos a definir") e devolve as listas de titulos e de marcadores.
 *
 * Nao sanitiza nada: o HTML ja era injetado via `dangerouslySetInnerHTML` antes
 * desta funcao existir, e a confianca na origem (o proprio backend) nao mudou.
 */
export function prepareDocumentHtml(html: string | null | undefined): PreparedDocument {
  if (!html) {
    return { html: '', headings: [], placeholders: [] };
  }

  // Sem DOM disponivel (SSR, testes em node): devolve o HTML intacto.
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return { html, headings: [], placeholders: [] };
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const body = parsed.body;
  const headings: DocumentHeading[] = [];
  const usedIds = new Set<string>();

  body.querySelectorAll('h2, h3').forEach((element) => {
    const text = (element.textContent ?? '').trim();
    if (!text) return;

    const id = uniqueId(slugify(text), usedIds);
    element.setAttribute('id', id);

    headings.push({ id, text, level: element.tagName === 'H2' ? 2 : 3 });
  });

  highlightPlaceholders(body, parsed, usedIds);

  return { html: body.innerHTML, headings, placeholders: collectPlaceholders(body) };
}
