
import {
  Alert,
  Snackbar,
} from '@mui/material';

interface SuccessSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const SuccessSnackbar = ({
  open,
  message,
  onClose,
}: SuccessSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
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
        severity="success"
        variant="filled"
        onClose={onClose}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;
