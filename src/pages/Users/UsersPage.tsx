import { useEffect, useState } from 'react';

import { Pencil, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/common/PageHeader';
import { UserModal } from '@/components/user/UserModal';
import { categoriesService } from '@/services/api/categoriesService';
import { getApiErrorMessage } from '@/services/api/httpClient';
import { usersService } from '@/services/api/usersService';
import type { AdminUserSummary, Category } from '@/types';

const ROLE_LABELS: Record<AdminUserSummary['role'], string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  USUARIO: 'Usuário',
};

export function UsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [openSuccessMessage, setOpenSuccessMessage] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setLoadError('');

      const data = await usersService.list();

      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);

      setLoadError(getApiErrorMessage(error, 'Não foi possível carregar os usuários.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await categoriesService.list();

      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  useEffect(() => {
    void loadUsers();
    void loadCategories();
  }, []);

  function showSuccessMessage(message: string) {
    setSuccessMessage(message);
    setOpenSuccessMessage(true);
  }

  // Equivalente ao `autoHideDuration` do Snackbar do MUI.
  useEffect(() => {
    if (!openSuccessMessage) return;

    const timeout = window.setTimeout(() => setOpenSuccessMessage(false), 4000);

    return () => window.clearTimeout(timeout);
  }, [openSuccessMessage, successMessage]);

  function handleOpenCreateModal() {
    setSelectedUser(null);
    setModalOpen(true);
  }

  function handleOpenEditModal(user: AdminUserSummary) {
    setSelectedUser(user);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedUser(null);
  }

  async function handleUserSuccess(action: 'created' | 'updated') {
    await loadUsers();

    showSuccessMessage(
      action === 'created' ? 'Usuário criado com sucesso.' : 'Usuário atualizado com sucesso.',
    );
  }

  function categoryNames(categoriaIds: number[]): string {
    if (categoriaIds.length === 0) {
      return '—';
    }

    return categories
      .filter((category) => categoriaIds.includes(category.id))
      .map((category) => category.name)
      .join(', ');
  }

  return (
    <div className="p-4 md:p-7">
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os usuários e seus perfis de acesso."
        action={
          <Button className="h-10 shrink-0 font-semibold" onClick={handleOpenCreateModal}>
            <Plus />
            Novo usuário
          </Button>
        }
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold">Nome</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Email</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Perfil</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Categorias</TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-3 text-center">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-3 text-center text-destructive">
                  {loadError}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-3 text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4 py-3">{user.name}</TableCell>
                  <TableCell className="px-4 py-3">{user.email}</TableCell>
                  <TableCell className="px-4 py-3">{ROLE_LABELS[user.role]}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-normal">
                    {categoryNames(user.categoriaIds)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        className="font-semibold text-primary"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        <Pencil />
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleUserSuccess}
        categories={categories}
        user={selectedUser}
      />

      {openSuccessMessage && (
        <div
          role="status"
          className="fixed right-4 bottom-4 left-4 z-50 flex items-start gap-3 rounded-lg bg-success px-3 py-2.5 text-primary-foreground shadow-lg sm:left-auto sm:max-w-md"
        >
          <span className="flex-1 text-body-sm">{successMessage}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setOpenSuccessMessage(false)}
            className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
