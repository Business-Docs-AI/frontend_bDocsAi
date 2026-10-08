import { httpClient } from '@/services/api/httpClient';
import type { Category, CategoryRequest } from '@/types';

export const categoriesService = {
  async list(): Promise<Category[]> {
    const { data } = await httpClient.get<Category[]>('/categories');
    return data;
  },

  async getById(id: number): Promise<Category> {
    const { data } = await httpClient.get<Category>(`/categories/${id}`);
    return data;
  },

  async create(request: CategoryRequest): Promise<Category> {
    const { data } = await httpClient.post<Category>('/categories', request);
    return data;
  },

  async update(id: number, request: CategoryRequest): Promise<Category> {
    const { data } = await httpClient.put<Category>(
      `/categories/${id}`,
      request,
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/categories/${id}`);
  },
};