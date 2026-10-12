import { httpClient } from '@/services/api/httpClient';
import type { Document, DocumentVersion } from '@/types';

export const documentsService = {
  async list(categoriaId?: number): Promise<Document[]> {
    const { data } = await httpClient.get<Document[]>('/documentos', {
      params: categoriaId ? { categoriaId } : undefined,
    });
    return data;
  },

  async getById(id: string): Promise<Document> {
    const { data } = await httpClient.get<Document>(`/documentos/${id}`);
    return data;
  },

  /**
   * Historico de versoes, do mais recente para o mais antigo.
   * Restrito a ADMIN/EDITOR no backend: um leitor comum recebe 403, que a tela
   * trata como "sem permissao" em vez de erro.
   */
  async listVersions(id: string): Promise<DocumentVersion[]> {
    const { data } = await httpClient.get<DocumentVersion[]>(`/documentos/${id}/versoes`);
    return data;
  },
};
