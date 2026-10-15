import { httpClient } from '@/services/api/httpClient';
import type { AdminUserSummary, UserRequest } from '@/types';

export const usersService = {
  async list(): Promise<AdminUserSummary[]> {
    const { data } = await httpClient.get<AdminUserSummary[]>('/users');
    return data;
  },

  async create(request: UserRequest): Promise<AdminUserSummary> {
    const { data } = await httpClient.post<AdminUserSummary>('/users', request);
    return data;
  },

  async update(id: number, request: UserRequest): Promise<AdminUserSummary> {
    const { data } = await httpClient.put<AdminUserSummary>(`/users/${id}`, request);
    return data;
  },
};
