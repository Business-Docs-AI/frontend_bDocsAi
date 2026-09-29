import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/config/env';

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

// Anexa o token de autenticação, quando disponível,
// a cada requisição.
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('@business-docs-ai:token');

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

// Tratamento centralizado dos erros de resposta.
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Sessão expirada ou inválida.
      localStorage.removeItem('@business-docs-ai:token');

      console.error('Unauthorized request.');
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