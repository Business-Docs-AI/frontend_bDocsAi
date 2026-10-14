// @ts-nocheck
import React, { useEffect, useState } from 'react';
import NotificationSnackbar, {
  type NotificationSeverity,
} from '../../components/common/NotificationSnackbar';

import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import type { UserSuccessAction } from '../../components/user/UserModal';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import UserModal from '../../components/user/UserModal';
import type { User } from '../../types/user';
import {
  getUsers,
  activateUser,
  deactivateUser,
} from '../../services/api/usersService';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const handleNewUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setUserModalOpen(false);
    setSelectedUser(null);
  };



const handleToggleUserStatus = async (user: User) => {
  if (updatingUserId !== null) {
    return;
  }

  try {
    setUpdatingUserId(user.id);

    if (user.active) {
      await deactivateUser(user.id);
    } else {
      await activateUser(user.id);
    }

        const refreshed = await loadUsers();

    if (!refreshed) {
      return;
    }

    showNotification(
      user.active
        ? 'User deactivated successfully.'
        : 'User activated successfully.',
      'success',
    );

    await loadUsers();
  } catch (error) {
    showNotification(
      getApiErrorMessage(error),
      'error',
    );

    console.error('Error updating user status:', error);
  } finally {
    setUpdatingUserId(null);
  }
};


interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
}

const [notification, setNotification] =
  useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

const handleUserSuccess = async (
  action: UserSuccessAction,
) => {
  const refreshed = await loadUsers();

  if (!refreshed) {
    return;
  }

  showNotification(
    action === 'created'
      ? 'User created successfully.'
      : 'User updated successfully.',
    'success',
  );
};

const showNotification = (
  message: string,
  severity: NotificationSeverity,
) => {
  setNotification({
    open: true,
    message,
    severity,
  });
};
const loadUsers = async (): Promise<boolean> => {
  try {
    setLoading(true);

    const data = await getUsers();

    setUsers(data);

    return true;
  } catch (error) {
    console.error('Error loading users:', error);

    setNotification({
      open: true,
      message: getApiErrorMessage(error),
      severity: 'error',
    });

    return false;
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Users
          </Typography>

          <Typography color="text.secondary">
            Manage users and their permissions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewUser}
        >
          New user
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.permissionId}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? 'Active' : 'Inactive'}
                      color={user.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label={`Edit ${user.name}`}
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color={user.active ? 'error' : 'success'}
                      aria-label={
                        user.active
                          ? `Deactivate ${user.name}`
                          : `Activate ${user.name}`
                      }
                      title={
                        user.active
                          ? 'Deactivate user'
                          : 'Activate user'
                      }
                      disabled={updatingUserId !== null}
                      onClick={() => handleToggleUserStatus(user)}
                    >
                      {user.active ? (
                        <PersonOffIcon fontSize="small" />
                      ) : (
                        <PersonAddAlt1Icon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
        <UserModal
          open={userModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleUserSuccess}
          onError={(message) =>
            showNotification(message, 'error')
          }
          user={selectedUser}
        />
        <NotificationSnackbar
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={() =>
            setNotification((current) => ({
              ...current,
              open: false,
            }))
          }
        />
    </Box>
  );
};

export default UsersPage;