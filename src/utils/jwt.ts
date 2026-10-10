import type { UserRole } from '@/types';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: unknown;
  roles?: unknown;
  authorities?: unknown;
  scope?: unknown;
  exp?: number;
  [key: string]: unknown;
}

const KNOWN_ROLES: UserRole[] = ['ADMIN', 'EDITOR', 'USUARIO'];

/** Decodifica o payload de um JWT sem validar a assinatura (apenas leitura local). */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/^ROLE_/, '').toUpperCase();
  return (KNOWN_ROLES as string[]).includes(normalized) ? (normalized as UserRole) : null;
}

/** O backend não documenta o claim exato de role; tenta as chaves mais comuns. */
function extractRole(payload: JwtPayload): UserRole {
  const candidates = [payload.role, payload.roles, payload.authorities, payload.scope];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const role = normalizeRole(item);
        if (role) return role;
      }
    } else {
      const role = normalizeRole(candidate);
      if (role) return role;
    }
  }

  return 'USUARIO';
}

export function buildAuthUserFromToken(token: string): { email: string; role: UserRole } {
  const payload = decodeJwtPayload(token) ?? {};
  return {
    email: payload.email ?? payload.sub ?? 'usuário',
    role: extractRole(payload),
  };
}
