import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, AlertTitle, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface AlertProps extends Omit<MuiAlertProps, 'severity' | 'onClose'> {
  /** Alert severity type */
  severity?: AlertSeverity;
  /** Alert title */
  title?: string;
  /** Whether alert can be dismissed */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Whether to show with animation */
  animate?: boolean;
  /** Whether alert is visible (for animation) */
  open?: boolean;
}

/**
 * Alert Component
 * 
 * Notification alert with different severity levels.
 * 
 * @example
 * ```tsx
 * <Alert severity="success" title="Success!">
 *   Your order has been placed.
 * </Alert>
 * <Alert severity="error" dismissible onDismiss={() => {}}>
 *   An error occurred.
 * </Alert>
 * ```
 */
export const Alert: React.FC<AlertProps> = ({
  severity = 'info',
  title,
  dismissible = false,
  onDismiss,
  animate = false,
  open = true,
  children,
  ...props
}) => {
  const alertContent = (
    <MuiAlert
      severity={severity}
      action={
        dismissible && onDismiss ? (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        ) : undefined
      }
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );

  if (animate) {
    return <Collapse in={open}>{alertContent}</Collapse>;
  }

  return alertContent;
};

Alert.displayName = 'Alert';

export default Alert;
