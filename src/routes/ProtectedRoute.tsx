import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { paths } from '@/routes/paths';

/** Bloqueia o acesso às rotas principais enquanto não houver uma sessão válida. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // O `tw` fica so neste ramo: os `children` retornam antes e nao podem herdar
    // o preflight escopado.
    return (
      <div className="tw flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />;
  }

  return <>{children}</>;
}
