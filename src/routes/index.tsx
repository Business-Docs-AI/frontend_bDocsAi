import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatPage } from '@/pages/Chat/ChatPage';
import { DocumentationPage } from '@/pages/Documentation/DocumentationPage';
import { CategoriesPage } from '@/pages/Categories/CategoriesPage';
import { IntegrationsPage } from '@/pages/Integrations/IntegrationsPage';
import { UsersPage } from '@/pages/Users/UsersPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { paths } from '@/routes/paths';

/**
 * Árvore de rotas da aplicação.
 * Todas as páginas ficam dentro do MainLayout (header + barra lateral
 * condicional + conteúdo). Adicione novas rotas aqui e em constants/navigation.ts
 * quando elas precisarem aparecer no menu.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={paths.chat} replace /> },
      { path: paths.chat, element: <ChatPage /> },
      { path: paths.documentation, element: <DocumentationPage /> },
      { path: paths.categories, element: <CategoriesPage /> },
      { path: paths.integrations, element: <IntegrationsPage /> },
      { path: paths.users, element: <UsersPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
