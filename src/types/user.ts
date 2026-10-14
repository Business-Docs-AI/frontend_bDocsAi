export interface User {
  id: number;
  name: string;
  email: string;
  permissionId: number;
  categoryIds: number[];
  active: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  permissionId: number;
  categoryIds: number[];
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  permissionId: number;
  categoryIds: number[];
}