import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { TOKEN_STORAGE_KEY } from '@/constants/auth';

/**
 * Instância central do axios usada por todos os serviços.
 * Novos endpoints devem usar este cliente em vez de criar um axios.create() paralelo.
 */
export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anexa o token de autenticação (quando disponível) a cada requisição.
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Tratamento centralizado de erros de resposta.
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      // Sessão expirada ou inválida: limpa o token local e manda para o login.
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

/** Extrai a mensagem de erro padronizada `{ message, status }` devolvida pelo backend. */
export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (error.message) return error.message;
  }

  return fallback;
}

/**
 * Timeout do lado do cliente (sem resposta HTTP nenhuma): a requisição foi abortada
 * localmente, mas o backend pode ter recebido e processado normalmente mesmo assim.
 * Diferente de um erro com resposta do servidor (4xx/5xx), que é uma falha definitiva.
 */
export function isTimeoutError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === 'ECONNABORTED';
}
