import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Header } from '@/components/layout/Header/Header';

/**
 * Layout principal da aplicação (header + conteúdo da rota).
 * O Chat tem sua própria coluna de conversas interna (responsiva), por isso
 * não há mais uma sidebar genérica aqui.
 */
export function MainLayout() {
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

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
