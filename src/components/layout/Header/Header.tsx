import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { navItems } from '@/constants/navigation';
import { env } from '@/config/env';
import { Logo } from '@/components/common/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
 */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : '';

  function handleSignOut() {
    logout();
    navigate(paths.login, { replace: true });
  }

  return (
    <header className="tw flex min-h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2 text-foreground sm:min-h-16 md:px-7">
      <div className="flex items-center gap-9">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-[17px] font-bold">{env.appName}</span>
        </div>

        <nav className="flex gap-6">
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

      <div className="flex items-center gap-4">
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
            <span className="leading-[1.2]">
              <span className="block text-body-sm font-semibold">{user?.email}</span>
              <span className="block text-[11px] text-muted-foreground/70">{roleLabel}</span>
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
