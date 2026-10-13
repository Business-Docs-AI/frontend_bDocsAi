import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';

export function UsersPage() {
  return (
    <div className="p-4 md:p-7">
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os usuários e suas permissões."
        action={
          <Button className="h-10 shrink-0 font-semibold">
            <Plus />
            Novo usuário
          </Button>
        }
      />
      {/* TODO: tabela de usuários (ver protótipo). */}
    </div>
  );
}
