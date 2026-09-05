import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { paths } from '@/routes/paths';

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const navItems: NavItem[] = [
  { label: 'Chat', path: paths.chat, icon: ChatBubbleOutlineIcon },
  { label: 'Documentation', path: paths.documentation, icon: DescriptionOutlinedIcon },
  { label: 'Categories', path: paths.categories, icon: CategoryOutlinedIcon },
  { label: 'Integrations', path: paths.integrations, icon: ExtensionOutlinedIcon },
  { label: 'Users', path: paths.users, icon: GroupOutlinedIcon },
];
