import { httpClient } from '@/services/api/httpClient';
import type { Document } from '@/types';

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
};
