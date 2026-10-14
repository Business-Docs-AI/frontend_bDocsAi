
/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import UserForm, {
  type UserFormData,
  type UserFormErrors,
} from './UserForm';

import type { User } from '../../types/user';

import {
  createUser,
  updateUser,
} from '../../services/api/usersService';

import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

export type UserSuccessAction = 'created' | 'updated';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (action: UserSuccessAction) => void;
  onError: (message: string) => void;
  user?: User | null;
}

const initialFormData: UserFormData = {
  name: '',
  email: '',
  permissionId: '',
  categoryIds: [],
};

const UserModal = ({
  open,
  onClose,
  onSuccess,
  onError,
  user,
}: UserModalProps) => {
  const isEditing = Boolean(user);

  const [formData, setFormData] =
    useState<UserFormData>(initialFormData);

  const [errors, setErrors] =
    useState<UserFormErrors>({});

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        permissionId: user.permissionId,
        categoryIds: user.categoryIds ?? [],
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [open, user]);

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email =
          'Enter a valid email address.';
      }
    }

    if (formData.permissionId === '') {
      newErrors.permissionId = 'Role is required.';
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds =
        'Select at least one category.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (
    field: keyof UserFormData,
  ) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };



const handleSubmit = async () => {
  if (!validateForm() || submitting) {
    return;
  }

  const userData = {
    name: formData.name.trim(),
    email: formData.email.trim(),
    permissionId: Number(formData.permissionId),
    categoryIds: formData.categoryIds,
  };

  try {
    setSubmitting(true);

    if (user) {
      await updateUser(user.id, userData);

      onClose();
      onSuccess('updated');
    } else {
      await createUser(userData);

      onClose();
      onSuccess('created');
    }
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);

    onError(errorMessage);

    console.error('Error saving user:', error);
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {isEditing ? 'Edit user' : 'New user'}

        <IconButton
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <UserForm
          value={formData}
          errors={errors}
          onChange={setFormData}
          onFieldChange={handleFieldChange}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>

<Button
  variant="contained"
  onClick={handleSubmit}
  disabled={submitting}
>
  {submitting
    ? isEditing
      ? 'Saving...'
      : 'Creating...'
    : isEditing
      ? 'Save changes'
      : 'Create'}
</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
