import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';

/**
 * Layout principal da aplicação (header + conteúdo da rota).
 * O Chat tem sua própria coluna de conversas interna (responsiva), por isso
 * não há mais uma sidebar genérica aqui.
 *
 * Atencao: a raiz NAO recebe a classe `tw` de proposito. O preflight escopado
 * valeria para todo o `<Outlet />`, incluindo as telas que ainda usam MUI, e
 * mudaria a aparencia delas. As classes utilitarias do Tailwind funcionam sem
 * `tw`; so o reset e escopado. Quem precisa do reset aqui e o `Header`, que ja
 * esta migrado e aplica a classe em si mesmo.
 */
export function MainLayout() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
