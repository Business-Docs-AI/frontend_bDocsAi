import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { PageHeader } from '@/components/common/PageHeader';
import { categoriesService } from '@/services/api/categoriesService';
import type { Category } from '@/types';

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

  function handleCloseSuccessMessage(
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSuccessMessage(false);
  }

  function resetValidationErrors() {
    setNameError(false);
    setNameLengthError(false);
    setDescriptionLengthError(false);
  }

  function validateFields(): boolean {
    const trimmedName = name.trim();

    const hasNameError = !trimmedName;
    const hasNameLengthError = trimmedName.length > 100;
    const hasDescriptionLengthError = description.length > 500;

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

      showSuccessMessage('Category created successfully.');
    } catch (error) {
      console.error('Failed to create category:', error);

      setCreateError(
        'Failed to create category. Please try again later.',
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

      showSuccessMessage('Category updated successfully.');
    } catch (error) {
      console.error('Failed to update category:', error);

      setEditError(
        'Failed to update category. Please try again later.',
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

      showSuccessMessage('Category deleted successfully.');
    } catch (error) {
      console.error('Failed to delete category:', error);

      setDeleteError(
        'Failed to delete category. Please try again later.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <PageHeader
        title="Categories"
        subtitle="Manage document categories."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
          >
            New category
          </Button>
        }
      />

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={600}>Name</Typography>
              </TableCell>

              <TableCell>
                <Typography fontWeight={600}>Description</Typography>
              </TableCell>

              <TableCell align="right">
                <Typography fontWeight={600}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>

                  <TableCell>{category.description}</TableCell>

                  <TableCell align="right">
                    <Button
                      variant="text"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEditModal(category)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDeleteModal(category)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create category modal */}
      <Dialog
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New category</DialogTitle>

        <DialogContent>
          {createError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {createError}
            </Typography>
          )}

          <TextField
            autoFocus
            fullWidth
            required
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(false);
              setNameLengthError(false);
              setCreateError('');
            }}
            error={nameError || nameLengthError}
            helperText={
              nameError
                ? 'Name is required.'
                : nameLengthError
                  ? 'Name must have at most 100 characters.'
                  : `${name.length}/100`
            }
            inputProps={{ maxLength: 100 }}
            margin="normal"
            disabled={creating}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setDescriptionLengthError(false);
              setCreateError('');
            }}
            error={descriptionLengthError}
            helperText={
              descriptionLengthError
                ? 'Description must have at most 500 characters.'
                : `${description.length}/500`
            }
            inputProps={{ maxLength: 500 }}
            multiline
            rows={4}
            margin="normal"
            disabled={creating}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseCreateModal}
            disabled={creating}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateCategory}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit category modal */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit category</DialogTitle>

        <DialogContent>
          {editError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {editError}
            </Typography>
          )}

          <TextField
            autoFocus
            fullWidth
            required
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(false);
              setNameLengthError(false);
              setEditError('');
            }}
            error={nameError || nameLengthError}
            helperText={
              nameError
                ? 'Name is required.'
                : nameLengthError
                  ? 'Name must have at most 100 characters.'
                  : `${name.length}/100`
            }
            inputProps={{ maxLength: 100 }}
            margin="normal"
            disabled={updating}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setDescriptionLengthError(false);
              setEditError('');
            }}
            error={descriptionLengthError}
            helperText={
              descriptionLengthError
                ? 'Description must have at most 500 characters.'
                : `${description.length}/500`
            }
            inputProps={{ maxLength: 500 }}
            multiline
            rows={4}
            margin="normal"
            disabled={updating}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseEditModal}
            disabled={updating}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateCategory}
            disabled={updating}
          >
            {updating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete category confirmation modal */}
      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Delete category</DialogTitle>

        <DialogContent>
          {deleteError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {deleteError}
            </Typography>
          )}

          <Typography>
            Are you sure you want to delete the category{' '}
            <strong>{selectedCategory?.name}</strong>?
          </Typography>

          <Typography sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseDeleteModal}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCategory}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success feedback */}
      <Snackbar
        open={openSuccessMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleCloseSuccessMessage}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}