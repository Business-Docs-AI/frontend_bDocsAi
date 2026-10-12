import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <p className="text-muted-foreground">Página não encontrada.</p>
      <Button
        render={<RouterLink to={paths.chat} />}
        className="mt-2 h-10 font-semibold"
      >
        Voltar ao início
      </Button>
    </div>
  );
}
