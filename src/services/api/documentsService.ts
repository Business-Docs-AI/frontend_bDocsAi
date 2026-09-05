import { httpClient } from '@/services/api/httpClient';
import type { Document } from '@/types';

/**
 * Exemplo de serviço de funcionalidade. Cada domínio (documentos, categorias,
 * integrações, usuários etc.) deve ter seu próprio arquivo aqui, expondo
 * funções puras que usam o httpClient central.
 */
export const documentsService = {
  async list(): Promise<Document[]> {
    const { data } = await httpClient.get<Document[]>('/documents');
    return data;
  },

  async getById(id: string): Promise<Document> {
    const { data } = await httpClient.get<Document>(`/documents/${id}`);
    return data;
  },
};
