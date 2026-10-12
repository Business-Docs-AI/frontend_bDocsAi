import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/pages/Login/LoginPage';
import { ChatPage } from '@/pages/Chat/ChatPage';
import { DocumentationPage } from '@/pages/Documentation/DocumentationPage';
import { CategoriesPage } from '@/pages/Categories/CategoriesPage';
import { UsersPage } from '@/pages/Users/UsersPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { paths } from '@/routes/paths';

/**
 * Árvore de rotas da aplicação.
 * Todas as páginas (exceto login) ficam dentro do MainLayout (header + conteúdo)
 * e exigem sessão ativa. Adicione novas rotas aqui e em constants/navigation.ts
 * quando elas precisarem aparecer no menu.
 */
export const router = createBrowserRouter([
  { path: paths.login, element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={paths.chat} replace /> },
      { path: paths.chat, element: <ChatPage /> },
      { path: paths.documentation, element: <DocumentationPage /> },
      { path: paths.categories, element: <CategoriesPage /> },
      { path: paths.users, element: <UsersPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
