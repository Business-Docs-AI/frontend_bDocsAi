import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';

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
 *
 * Altura: `min-h-dvh` (em vez de `h-screen`/100vh) porque em navegadores
 * móveis o 100vh não acompanha a barra de endereço e deixa um espaço morto ou
 * corta conteúdo. Para as páginas comuns o `<main>` cresce com o conteúdo e a
 * rolagem é só uma, na página — sem caixa interna de altura fixa. O Chat é a
 * exceção: ele monta colunas com rolagem própria e precisa ocupar exatamente
 * a altura visível (`h-dvh` + `overflow-hidden`), nunca crescer com a página.
 */
export function MainLayout() {
  const { pathname } = useLocation();
  const isChat = pathname === paths.chat;

  return (
    <div className={cn('flex min-h-dvh w-full flex-col bg-background', isChat && 'h-dvh overflow-hidden')}>
      <Header />

      <main className={cn('min-w-0 flex-1', isChat && 'min-h-0 overflow-hidden')}>
        <Outlet />
      </main>
    </div>
  );
}
