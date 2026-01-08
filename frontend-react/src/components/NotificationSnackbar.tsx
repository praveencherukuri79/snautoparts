import React from 'react';
import { Snackbar } from '@mui/material';
import { useRecoilState } from 'recoil';
import { notificationAtom } from '@/state/atoms';
import { Alert } from '@/primitives';

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
      <Alert
        severity={notification?.type ?? 'info'}
        dismissible
        onDismiss={handleClose}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
