import { httpClient } from '@/services/api/httpClient';
import type { LoginResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },
};
