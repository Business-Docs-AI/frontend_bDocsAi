import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/config/env';
import { TOKEN_STORAGE_KEY } from '@/constants/auth';

/**
 * Instância central do axios usada por todos os serviços.
 * Novos endpoints devem usar este cliente em vez de criar um axios.create()
 * paralelo.
 */
export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anexa o token de autenticação (quando disponível) a cada requisição.
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);

    return Promise.reject(error);
  },
);

// Tratamento centralizado de erros de resposta.
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      // Sessão expirada ou inválida: limpa o token local e manda para o login.
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      console.error('Unauthorized request.');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 400) {
      console.error('Bad request:', error.response?.data);
    } else if (status === 403) {
      console.error('Access denied.');
    } else if (status === 404) {
      console.error('Resource not found.');
    } else if (status === 409) {
      console.error('Conflict:', error.response?.data);
    } else if (status && status >= 500) {
      console.error('Server error:', error.response?.data);
    } else if (error.request) {
      console.error('No response received from server.');
    } else {
      console.error('Request configuration error:', error.message);
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
