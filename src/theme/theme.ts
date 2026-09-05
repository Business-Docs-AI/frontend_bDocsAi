import { createTheme } from '@mui/material/styles';

/**
 * Tema central da biblioteca de componentes (MUI).
 * Qualquer cor, espacamento ou tipografia usada nas telas deve vir
 * daqui - evite cores "soltas" (hex direto) dentro dos componentes.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F0554A',
      dark: '#D8392E',
      light: '#FDECEA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5B4FCF',
    },
    background: {
      default: '#F7F7F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#221F1C',
      secondary: '#6E6B64',
    },
    divider: '#E7E5DF',
    success: { main: '#1F8A4C' },
    warning: { main: '#B4740E' },
    error: { main: '#C23A34' },
    info: { main: '#1E63C9' },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: 22, fontWeight: 700 },
    h2: { fontSize: 18, fontWeight: 700 },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#221F1C',
          boxShadow: 'none',
          borderBottom: '1px solid #E7E5DF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
