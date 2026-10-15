import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApiErrorMessage } from '@/services/api/httpClient';
import { usersService } from '@/services/api/usersService';
import type { AdminUserSummary, Category } from '@/types';

import { UserForm, type UserFormData, type UserFormErrors } from './UserForm';

export type UserSuccessAction = 'created' | 'updated';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (action: UserSuccessAction) => void;
  categories: Category[];
  user?: AdminUserSummary | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildInitialFormData(user?: AdminUserSummary | null): UserFormData {
  if (!user) {
    return { name: '', email: '', password: '', role: undefined, categoriaIds: [] };
  }

  return {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    categoriaIds: user.categoriaIds,
  };
}

export function UserModal({ open, onClose, onSuccess, categories, user }: UserModalProps) {
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState<UserFormData>(() => buildInitialFormData(user));
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(buildInitialFormData(user));
    setErrors({});
    setSubmitError('');
  }, [open, user]);

  function handleFieldChange(field: keyof UserFormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  }

  function validateForm(): boolean {
    const newErrors: UserFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Informe um email válido.';
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'A senha é obrigatória.';
    }

    if (!formData.role) {
      newErrors.role = 'O perfil é obrigatório.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleClose() {
    if (submitting) return;

    onClose();
  }

  async function handleSubmit() {
    if (!validateForm() || submitting || !formData.role) {
      return;
    }

    setSubmitError('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      categoriaIds: formData.categoriaIds,
      ...(formData.password.trim() ? { password: formData.password.trim() } : {}),
    };

    try {
      setSubmitting(true);

      if (user) {
        await usersService.update(user.id, payload);
        onClose();
        onSuccess('updated');
      } else {
        await usersService.create(payload);
        onClose();
        onSuccess('created');
      }
    } catch (error) {
      console.error('Failed to save user:', error);

      setSubmitError(getApiErrorMessage(error, 'Não foi possível salvar o usuário.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="m-0">{isEditing ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
        </DialogHeader>

        {submitError && <p className="m-0 text-destructive">{submitError}</p>}

        <UserForm
          value={formData}
          errors={errors}
          isEditing={isEditing}
          categories={categories}
          disabled={submitting}
          onChange={setFormData}
          onFieldChange={handleFieldChange}
        />

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? isEditing
                ? 'Salvando...'
                : 'Criando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
