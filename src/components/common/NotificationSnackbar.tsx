
import {
  Alert,
  Snackbar,
} from '@mui/material';

export type NotificationSeverity = 'success' | 'error';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  onClose: () => void;
}

const NotificationSnackbar = ({
  open,
  message,
  severity,
  onClose,
}: NotificationSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') {
          onClose();
        }
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
