export interface Document {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdBy: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Editor' | 'User';
  status: 'Active' | 'Inactive';
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}