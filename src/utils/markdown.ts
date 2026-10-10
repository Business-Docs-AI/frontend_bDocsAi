function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
}

/**
 * Conversor simples de Markdown leve (negrito, listas, parágrafos) para HTML,
 * suficiente para o texto retornado pelo assistente de chat.
 */
export function renderMarkdownLite(text: string): string {
  const lines = escapeHtml(text).split('\n');
  const htmlBlocks: string[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length > 0) {
      htmlBlocks.push(`<ul>${listBuffer.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
      listBuffer = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const listMatch = /^[-*]\s+(.*)$/.exec(line);

    if (listMatch) {
      listBuffer.push(listMatch[1]);
      continue;
    }

    flushList();

    if (line.length === 0) {
      continue;
    }

    htmlBlocks.push(`<p>${inline(line)}</p>`);
  }

  flushList();

  return htmlBlocks.join('');
}
