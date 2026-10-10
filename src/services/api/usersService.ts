import { httpClient } from '@/services/api/httpClient';
import type { AdminUserSummary } from '@/types';

/**
 * GET /users só é acessível para ADMIN. É usado best-effort para resolver a role
 * do próprio usuário logado (o token JWT não carrega essa informação) — ver useAuth.
 */
export const usersService = {
  async list(): Promise<AdminUserSummary[]> {
    const { data } = await httpClient.get<AdminUserSummary[]>('/users');
    return data;
  },
};
