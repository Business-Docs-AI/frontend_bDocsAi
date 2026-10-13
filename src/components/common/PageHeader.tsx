import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * Cabeçalho padrão usado no topo de cada página de conteúdo.
 *
 * Atencao: este componente e compartilhado com telas que ainda usam MUI e que,
 * por isso, renderizam fora de um escopo `.tw` (sem o preflight do Tailwind).
 * As margens e o line-height sao declarados explicitamente (`m-0`, `mb-0`,
 * `leading-[1.167]` - o padrao do `Typography variant="h1"` do MUI) para que o
 * resultado seja identico com ou sem o reset. Quando todas as telas estiverem
 * migradas, o `leading-[1.167]` pode voltar ao valor do token `text-h1`.
 */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="m-0 text-h1 leading-[1.167]">{title}</h1>
        {subtitle && (
          <p className="mt-1 mb-0 text-body-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
