import { useEffect } from 'react';
import { env } from '@/config/env';

/** Atualiza o título da aba do navegador. Uso: useDocumentTitle('Chat'); */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${env.appName}`;
  }, [title]);
}
