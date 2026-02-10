import type { AlertColor } from '@mui/material';

import { Alert, Snackbar } from '@mui/material';

type DefaulSnackBarProps = {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
};

export function DefaultSnackBar({ open, message, severity, onClose }: DefaulSnackBarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
