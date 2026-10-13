/** Uma linha da tabela de metadados do bloco de identificacao. */
export interface DocumentMetaField {
  label: string;
  value: string;
}

/**
 * Monta a lista de metadados ignorando o que nao tem valor: campo nulo, vazio
 * ou so com espacos simplesmente nao entra — nunca aparece rotulo sem valor
 * nem "undefined" na folha.
 */
export function buildMetaFields(
  entries: Array<[string, string | number | null | undefined]>,
): DocumentMetaField[] {
  const fields: DocumentMetaField[] = [];

  for (const [label, raw] of entries) {
    const value = typeof raw === 'number' ? String(raw) : (raw ?? '').trim();
    if (value) fields.push({ label, value });
  }

  return fields;
}
