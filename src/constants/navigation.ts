import {
  MessageSquare,
  FileText,
  Shapes,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/routes/paths';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Chat', path: paths.chat, icon: MessageSquare },
  { label: 'Documentação', path: paths.documentation, icon: FileText },
  { label: 'Categorias', path: paths.categories, icon: Shapes },
  { label: 'Usuários', path: paths.users, icon: Users },
];
