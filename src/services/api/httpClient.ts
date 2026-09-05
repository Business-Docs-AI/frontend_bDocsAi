import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

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
  const token = localStorage.getItem('@business-docs-ai:token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Tratamento centralizado de erros de resposta.
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Sessão expirada ou inválida: limpa o token local.
      // A camada de autenticação deve reagir a isso, por exemplo,
      // redirecionando para a tela de login.
      localStorage.removeItem('@business-docs-ai:token');
    }

    return Promise.reject(error);
  },
);
