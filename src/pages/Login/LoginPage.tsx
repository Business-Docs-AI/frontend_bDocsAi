import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import { getApiErrorMessage, isTimeoutError } from '@/services/api/httpClient';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? paths.chat;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Sem timeout explicito, o axios devolve "timeout of 15000ms exceeded"
      // (ingles e tecnico) e o usuario leria isso como credencial invalida.
      setError(
        isTimeoutError(err)
          ? 'O servidor demorou para responder. Verifique sua conexão e tente novamente.'
          : getApiErrorMessage(err, 'E-mail ou senha inválidos.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="tw flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-8">
        <div className="mb-7 flex flex-col items-center gap-1.5">
          <Logo size={32} />
          <h1 className="mt-1 text-xl font-bold text-foreground">{env.appName}</h1>
          <p className="text-body-sm text-muted-foreground">Entre para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <Alert
              variant="destructive"
              className="border-destructive/25 bg-destructive/10"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-body-sm text-muted-foreground">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="voce@empresa.com.br"
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-body-sm text-muted-foreground">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className="h-10"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="h-10 w-full font-semibold">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
