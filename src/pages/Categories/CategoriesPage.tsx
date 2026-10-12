import { useEffect, useState } from 'react';

import { Pencil, Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { PageHeader } from '@/components/common/PageHeader';
import { categoriesService } from '@/services/api/categoriesService';
import type { Category } from '@/types';

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

interface CategoryFormFieldsProps {
  name: string;
  description: string;
  nameError: boolean;
  nameLengthError: boolean;
  descriptionLengthError: boolean;
  disabled: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

/**
 * Campos do formulario de categoria, identicos nos modais de criar e editar.
 * Reproduz o `TextField` do MUI: label, estado de erro e `helperText` que
 * alterna entre a mensagem de validacao e o contador de caracteres.
 */
function CategoryFormFields({
  name,
  description,
  nameError,
  nameLengthError,
  descriptionLengthError,
  disabled,
  onNameChange,
  onDescriptionChange,
}: CategoryFormFieldsProps) {
  const nameInvalid = nameError || nameLengthError;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category-name" className="text-body-sm text-muted-foreground">
          Nome *
        </Label>
        <Input
          id="category-name"
          autoFocus
          required
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-invalid={nameInvalid}
          maxLength={NAME_MAX_LENGTH}
          disabled={disabled}
          className="h-10"
        />
        <p className={cn('text-xs', nameInvalid ? 'text-destructive' : 'text-muted-foreground')}>
          {nameError
            ? 'O nome é obrigatório.'
            : nameLengthError
              ? `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`
              : `${name.length}/${NAME_MAX_LENGTH}`}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category-description" className="text-body-sm text-muted-foreground">
          Descrição
        </Label>
        <Textarea
          id="category-description"
          rows={4}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          aria-invalid={descriptionLengthError}
          maxLength={DESCRIPTION_MAX_LENGTH}
          disabled={disabled}
          className="resize-none"
        />
        <p
          className={cn(
            'text-xs',
            descriptionLengthError ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {descriptionLengthError
            ? `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`
            : `${description.length}/${DESCRIPTION_MAX_LENGTH}`}
        </p>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [nameError, setNameError] = useState(false);
  const [nameLengthError, setNameLengthError] = useState(false);
  const [descriptionLengthError, setDescriptionLengthError] =
    useState(false);

  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [openSuccessMessage, setOpenSuccessMessage] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);

      const data = await categoriesService.list();

      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function showSuccessMessage(message: string) {
    setSuccessMessage(message);
    setOpenSuccessMessage(true);
  }

  function closeSuccessMessage() {
    setOpenSuccessMessage(false);
  }

  // Equivalente ao `autoHideDuration` do Snackbar do MUI.
  useEffect(() => {
    if (!openSuccessMessage) return;

    const timeout = window.setTimeout(() => setOpenSuccessMessage(false), 4000);

    return () => window.clearTimeout(timeout);
  }, [openSuccessMessage, successMessage]);

  function resetValidationErrors() {
    setNameError(false);
    setNameLengthError(false);
    setDescriptionLengthError(false);
  }

  function validateFields(): boolean {
    const trimmedName = name.trim();

    const hasNameError = !trimmedName;
    const hasNameLengthError = trimmedName.length > NAME_MAX_LENGTH;
    const hasDescriptionLengthError = description.length > DESCRIPTION_MAX_LENGTH;

    setNameError(hasNameError);
    setNameLengthError(hasNameLengthError);
    setDescriptionLengthError(hasDescriptionLengthError);

    return (
      !hasNameError &&
      !hasNameLengthError &&
      !hasDescriptionLengthError
    );
  }

  function handleOpenCreateModal() {
    setName('');
    setDescription('');
    resetValidationErrors();
    setCreateError('');
    setOpenCreateModal(true);
  }

  function handleCloseCreateModal() {
    if (creating) {
      return;
    }

    setOpenCreateModal(false);
  }

  async function handleCreateCategory() {
    if (!validateFields()) {
      return;
    }

    setCreateError('');

    try {
      setCreating(true);

      await categoriesService.create({
        name: name.trim(),
        description: description.trim(),
      });

      setOpenCreateModal(false);

      setName('');
      setDescription('');
      resetValidationErrors();

      await loadCategories();

      showSuccessMessage('Categoria criada com sucesso.');
    } catch (error) {
      console.error('Failed to create category:', error);

      setCreateError(
        'Não foi possível criar a categoria. Tente novamente mais tarde.',
      );
    } finally {
      setCreating(false);
    }
  }

  function handleOpenEditModal(category: Category) {
    setSelectedCategory(category);

    setName(category.name);
    setDescription(category.description);

    resetValidationErrors();
    setEditError('');

    setOpenEditModal(true);
  }

  function handleCloseEditModal() {
    if (updating) {
      return;
    }

    setOpenEditModal(false);
    setSelectedCategory(null);
  }

  async function handleUpdateCategory() {
    if (!selectedCategory) {
      return;
    }

    if (!validateFields()) {
      return;
    }

    setEditError('');

    try {
      setUpdating(true);

      await categoriesService.update(selectedCategory.id, {
        name: name.trim(),
        description: description.trim(),
      });

      setOpenEditModal(false);
      setSelectedCategory(null);

      setName('');
      setDescription('');
      resetValidationErrors();

      await loadCategories();

      showSuccessMessage('Categoria atualizada com sucesso.');
    } catch (error) {
      console.error('Failed to update category:', error);

      setEditError(
        'Não foi possível atualizar a categoria. Tente novamente mais tarde.',
      );
    } finally {
      setUpdating(false);
    }
  }

  function handleOpenDeleteModal(category: Category) {
    setSelectedCategory(category);
    setDeleteError('');
    setOpenDeleteModal(true);
  }

  function handleCloseDeleteModal() {
    if (deleting) {
      return;
    }

    setOpenDeleteModal(false);
    setSelectedCategory(null);
    setDeleteError('');
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) {
      return;
    }

    setDeleteError('');

    try {
      setDeleting(true);

      await categoriesService.delete(selectedCategory.id);

      setOpenDeleteModal(false);
      setSelectedCategory(null);

      await loadCategories();

      showSuccessMessage('Categoria excluída com sucesso.');
    } catch (error) {
      console.error('Failed to delete category:', error);

      setDeleteError(
        'Não foi possível excluir a categoria. Tente novamente mais tarde.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="tw p-4 md:p-7">
      <PageHeader
        title="Categorias"
        subtitle="Gerencie as categorias de documentos."
        action={
          <Button className="h-10 shrink-0 font-semibold" onClick={handleOpenCreateModal}>
            <Plus />
            Nova categoria
          </Button>
        }
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold">Nome</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Descrição</TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="px-4 py-3 text-center">
                  Carregando categorias...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="px-4 py-3 text-center">
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="px-4 py-3">{category.name}</TableCell>

                  <TableCell className="px-4 py-3 whitespace-normal">
                    {category.description}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        className="font-semibold text-primary"
                        onClick={() => handleOpenEditModal(category)}
                      >
                        <Pencil />
                        Editar
                      </Button>

                      <Button
                        variant="ghost"
                        className="font-semibold text-destructive hover:bg-destructive/10"
                        onClick={() => handleOpenDeleteModal(category)}
                      >
                        <Trash2 />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create category modal */}
      <Dialog
        open={openCreateModal}
        onOpenChange={(open) => {
          if (!open) handleCloseCreateModal();
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="m-0">Nova categoria</DialogTitle>
          </DialogHeader>

          {createError && <p className="m-0 text-destructive">{createError}</p>}

          <CategoryFormFields
            name={name}
            description={description}
            nameError={nameError}
            nameLengthError={nameLengthError}
            descriptionLengthError={descriptionLengthError}
            disabled={creating}
            onNameChange={(value) => {
              setName(value);
              setNameError(false);
              setNameLengthError(false);
              setCreateError('');
            }}
            onDescriptionChange={(value) => {
              setDescription(value);
              setDescriptionLengthError(false);
              setCreateError('');
            }}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseCreateModal} disabled={creating}>
              Cancelar
            </Button>

            <Button onClick={handleCreateCategory} disabled={creating}>
              {creating ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit category modal */}
      <Dialog
        open={openEditModal}
        onOpenChange={(open) => {
          if (!open) handleCloseEditModal();
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="m-0">Editar categoria</DialogTitle>
          </DialogHeader>

          {editError && <p className="m-0 text-destructive">{editError}</p>}

          <CategoryFormFields
            name={name}
            description={description}
            nameError={nameError}
            nameLengthError={nameLengthError}
            descriptionLengthError={descriptionLengthError}
            disabled={updating}
            onNameChange={(value) => {
              setName(value);
              setNameError(false);
              setNameLengthError(false);
              setEditError('');
            }}
            onDescriptionChange={(value) => {
              setDescription(value);
              setDescriptionLengthError(false);
              setEditError('');
            }}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseEditModal} disabled={updating}>
              Cancelar
            </Button>

            <Button onClick={handleUpdateCategory} disabled={updating}>
              {updating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete category confirmation modal */}
      <Dialog
        open={openDeleteModal}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteModal();
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="m-0">Excluir categoria</DialogTitle>
          </DialogHeader>

          {deleteError && <p className="m-0 text-destructive">{deleteError}</p>}

          <div className="flex flex-col gap-2">
            <p className="m-0">
              Tem certeza de que deseja excluir a categoria{' '}
              <strong className="font-bold">{selectedCategory?.name}</strong>?
            </p>

            <p className="m-0">Essa ação não pode ser desfeita.</p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDeleteModal} disabled={deleting}>
              Cancelar
            </Button>

            <Button
              onClick={handleDeleteCategory}
              disabled={deleting}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success feedback */}
      {openSuccessMessage && (
        <div
          role="status"
          className="fixed right-4 bottom-4 left-4 z-50 flex items-start gap-3 rounded-lg bg-success px-3 py-2.5 text-primary-foreground shadow-lg sm:left-auto sm:max-w-md"
        >
          <span className="flex-1 text-body-sm">{successMessage}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={closeSuccessMessage}
            className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
