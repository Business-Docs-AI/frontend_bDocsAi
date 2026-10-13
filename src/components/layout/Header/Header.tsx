import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { navItems } from '@/constants/navigation';
import { env } from '@/config/env';
import { Logo } from '@/components/common/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/useAuth';
import { paths } from '@/routes/paths';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  USUARIO: 'Usuário',
};

/**
 * Cabeçalho fixo presente em todas as telas.
 * Contém a marca, a navegação principal, as notificações e o menu do usuário.
 * Abaixo de `md`, a navegação vira um menu hambúrguer (Sheet) e o bloco do
 * usuário fica só com o avatar — e-mail/cargo passam para dentro do menu.
 */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : '';

  function handleSignOut() {
    logout();
    navigate(paths.login, { replace: true });
  }

  return (
    <header className="tw sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2 text-foreground sm:min-h-16 md:px-7">
      <div className="flex min-w-0 items-center gap-2 md:gap-9">
        <button
          type="button"
          aria-label="Abrir menu de navegação"
          onClick={() => setMobileNavOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <Logo />
          <span className="truncate text-[17px] font-bold">{env.appName}</span>
        </div>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="border-b-2 border-transparent pb-4 text-body font-medium text-muted-foreground [&.active]:border-primary [&.active]:text-primary"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="rounded-full p-1.5 text-foreground transition-colors hover:bg-foreground/5"
        >
          <Bell className="size-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2.5 text-left outline-none">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-xs font-bold text-brand-violet">
              {initials}
            </span>
            <span className="hidden max-w-[180px] leading-[1.2] md:inline">
              <span className="block truncate text-body-sm font-semibold">{user?.email}</span>
              <span className="block text-[11px] text-muted-foreground/70">{roleLabel}</span>
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-[200px]">
            <div className="px-1.5 py-1.5 md:hidden">
              <p className="truncate text-sm font-semibold text-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" showCloseButton={false} className="tw w-[260px] p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Logo />
              {env.appName}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-foreground/5 [&.active]:bg-accent [&.active]:text-primary"
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
