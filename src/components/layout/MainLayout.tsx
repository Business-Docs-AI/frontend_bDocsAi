import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { paths } from '@/routes/paths';

/**
 * Layout principal da aplicação.
 * A barra lateral de conversas só é relevante no Chat, por isso é renderizada
 * condicionalmente com base na rota atual; as outras telas usam toda a largura.
 */
export function MainLayout() {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith(paths.chat);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <Header />

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {isChatRoute && <Sidebar />}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
