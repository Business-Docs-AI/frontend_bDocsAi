import { useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services/api/authService';
import { usersService } from '@/services/api/usersService';
import { TOKEN_STORAGE_KEY } from '@/constants/auth';
import { buildAuthUserFromToken, isTokenExpired } from '@/utils/jwt';
import { AuthContext } from '@/contexts/authContextBase';
import type { AuthUser } from '@/types';

/**
 * O token JWT emitido pelo backend só carrega `sub` (email) — sem a role. A única
 * rota que devolve a role do próprio usuário é GET /users, mas ela é restrita a
 * ADMIN. Por isso: tenta resolver a role de verdade via /users (funciona para quem
 * é ADMIN); se der 403/erro (demais roles), cai no fallback seguro do token (USUARIO).
 */
async function resolveAuthUser(token: string): Promise<AuthUser> {
  const fallback = buildAuthUserFromToken(token);

  try {
    const users = await usersService.list();
    const match = users.find((item) => item.email.toLowerCase() === fallback.email.toLowerCase());
    if (match) return { email: match.email, role: match.role };
  } catch {
    // 403 para não-ADMIN (ou erro de rede): mantém o fallback derivado do token.
  }

  return fallback;
}

/** Provedor de autenticação: guarda o token (JWT) no localStorage e deriva o usuário a partir dele. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token && !isTokenExpired(token)) {
      resolveAuthUser(token)
        .then(setUser)
        .finally(() => setIsLoading(false));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { token } = await authService.login(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(await resolveAuthUser(token));
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
