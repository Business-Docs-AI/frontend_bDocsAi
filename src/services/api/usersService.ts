import { httpClient } from './httpClient';

import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '../../types/user';

export const getUsers = async (): Promise<User[]> => {
  const response = await httpClient.get<User[]>('/users');

  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await httpClient.get<User>(`/users/${id}`);

  return response.data;
};

export const createUser = async (
  data: CreateUserRequest,
): Promise<User> => {
  const response = await httpClient.post<User>('/users', data);

  return response.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserRequest,
): Promise<User> => {
  const response = await httpClient.put<User>(
    `/users/${id}`,
    data,
  );

  return response.data;
};

export const activateUser = async (id: number): Promise<User> => {
  const response = await httpClient.patch<User>(
    `/users/${id}/activate`,
  );

  return response.data;
};

export const deactivateUser = async (id: number): Promise<User> => {
  const response = await httpClient.patch<User>(
    `/users/${id}/deactivate`,
  );

  return response.data;
};

export const usersService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
};