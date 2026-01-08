import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { useRecoilState } from 'recoil';
import { notificationAtom } from '@/state/atoms';

/**
 * NotificationSnackbar Component
 * 
 * Global notification snackbar that listens to notification state.
 * Displays success, error, warning, and info messages.
 */
const NotificationSnackbar: React.FC = () => {
  const [notification, setNotification] = useRecoilState(notificationAtom);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(null);
  };

  if (!notification) {
    return null;
  }

  return (
    <Snackbar
      open={Boolean(notification?.message)}
      autoHideDuration={notification?.duration ?? 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <MuiAlert
        onClose={handleClose}
        severity={notification?.type ?? 'info'}
        variant="filled"
        elevation={6}
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </MuiAlert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
