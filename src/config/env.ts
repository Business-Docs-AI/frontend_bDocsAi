/**
 * Ponto único de leitura das variáveis de ambiente.
 * Não use `import.meta.env` diretamente no restante do app; importe `env`
 * deste módulo para facilitar testes, validação e futuras mudanças de configuração.
 */
function readEnv() {
  const appName = import.meta.env.VITE_APP_NAME ?? 'BusinessDocsAi';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);

  if (!apiBaseUrl) {
    // Falha cedo e de forma clara quando o .env não foi configurado.
    console.warn(
      '[env] VITE_API_BASE_URL is not defined. Copy .env.example to .env and adjust the values.',
    );
  }

  return {
    appName,
    apiBaseUrl: apiBaseUrl ?? 'http://localhost:3333/api',
    apiTimeout,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  };
}

export const env = readEnv();
