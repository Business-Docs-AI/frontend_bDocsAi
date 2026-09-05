import { useState, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { navItems } from '@/constants/navigation';
import { env } from '@/config/env';
import { Logo } from '@/components/common/Logo';

/**
 * Cabeçalho fixo presente em todas as telas.
 * Contém a marca, a navegação principal, as notificações e o menu do usuário.
 */
export function Header() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  function handleOpenMenu(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  return (
    <AppBar position="static" component="header">
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3.5 }, py: 1 }}>
        <Stack direction="row" alignItems="center" spacing={4.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Logo />
            <Typography variant="h1" component="span" sx={{ fontSize: 17 }}>
              {env.appName}
            </Typography>
          </Stack>

          <Stack direction="row" component="nav" spacing={3}>
            {navItems.map((item) => (
              <Box
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  pb: 2,
                  borderBottom: '2px solid transparent',
                  '&.active': {
                    color: 'primary.main',
                    borderBottomColor: 'primary.main',
                  },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton aria-label="Notifications" size="small">
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            onClick={handleOpenMenu}
            sx={{ cursor: 'pointer' }}
            aria-controls={menuOpen ? 'user-menu' : undefined}
            aria-haspopup="true"
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#EFEDFB', color: '#5B4FCF' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>AS</Typography>
            </Avatar>
            <Box sx={{ lineHeight: 1.2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Arthur Silva</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                Administrator
              </Typography>
            </Box>
          </Stack>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
