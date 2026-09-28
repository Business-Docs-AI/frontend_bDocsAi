export interface Document {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdBy: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  documentCount: number;
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
