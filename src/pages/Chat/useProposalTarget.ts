import { useEffect, useState } from 'react';
import { documentsService } from '@/services/api/documentsService';
import type { Document } from '@/types';

/**
 * Carrega o documento que uma proposta de ATUALIZAR substitui.
 *
 * A API de proposta/rascunho devolve apenas o `documentoIdAlvo` — o titulo e a
 * versao atual, que o selo "Nova versao de: ..." mostra, vem deste GET
 * /documentos/{id}. E so leitura: nada aqui altera a proposta, o polling ou a
 * confirmacao. Falha (403/404/rede) e tratada como "nao disponivel": o selo
 * apenas omite o nome do documento, sem erro na tela.
 */
export function useProposalTarget(documentoIdAlvo: string | null): Document | null {
  const [target, setTarget] = useState<Document | null>(null);

  useEffect(() => {
    setTarget(null);

    if (!documentoIdAlvo) return;

    let active = true;

    documentsService
      .getById(documentoIdAlvo)
      .then((document) => {
        if (active) setTarget(document);
      })
      .catch(() => {
        // Sem o documento de origem o selo fica sem o nome — nao e um erro de tela.
      });

    return () => {
      active = false;
    };
  }, [documentoIdAlvo]);

  return target;
}
