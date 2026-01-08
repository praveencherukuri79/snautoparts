/**
 * Dialog Service
 * 
 * Async dialog service that allows awaiting user actions
 * Usage: const confirmed = await dialogService.confirm({ ... })
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import { CloseIcon } from '@/icons';
import { Button } from '@/primitives';

// Dialog types
export interface ConfirmDialogOptions {
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  icon?: ReactNode;
}

export interface AlertDialogOptions {
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  icon?: ReactNode;
}

interface DialogState {
  open: boolean;
  type: 'confirm' | 'alert' | null;
  options: ConfirmDialogOptions | AlertDialogOptions | null;
  resolver: ((value: boolean) => void) | null;
}

interface DialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

/**
 * Dialog Provider Component
 */
export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DialogState>({
    open: false,
    type: null,
    options: null,
    resolver: null,
  });
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        type: 'confirm',
        options,
        resolver: resolve,
      });
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        type: 'alert',
        options,
        resolver: () => {
          resolve();
          return true;
        },
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    
    if (state.resolver) {
      state.resolver(false);
    }
    setState({
      open: false,
      type: null,
      options: null,
      resolver: null,
    });
  }, [state.resolver, loading]);

  const handleConfirm = useCallback(async () => {
    if (state.resolver) {
      setLoading(true);
      // Small delay to show loading state if action is very fast
      await new Promise(resolve => setTimeout(resolve, 100));
      state.resolver(true);
      setLoading(false);
    }
    setState({
      open: false,
      type: null,
      options: null,
      resolver: null,
    });
  }, [state.resolver]);

  const renderDialog = () => {
    if (!state.options) return null;

    const isConfirm = state.type === 'confirm';
    const confirmOptions = state.options as ConfirmDialogOptions;
    const alertOptions = state.options as AlertDialogOptions;

    return (
      <Dialog
        open={state.open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1}>
              {state.options.icon}
              <Typography
                variant="h6"
                fontWeight={700}
                color={isConfirm && confirmOptions.isDangerous ? 'error.main' : 'text.primary'}
              >
                {state.options.title}
              </Typography>
            </Stack>
            <IconButton onClick={handleClose} disabled={loading} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {typeof state.options.message === 'string' ? (
            <Typography>{state.options.message}</Typography>
          ) : (
            state.options.message
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {isConfirm ? (
            <>
              <Button onClick={handleClose} disabled={loading}>
                {confirmOptions.cancelText || 'Cancel'}
              </Button>
              <Button
                variant={confirmOptions.isDangerous ? 'outlined' : 'primary'}
                onClick={handleConfirm}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
                sx={
                  confirmOptions.isDangerous
                    ? { color: 'error.main', borderColor: 'error.main' }
                    : undefined
                }
              >
                {loading ? 'Processing...' : confirmOptions.confirmText || 'Confirm'}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleConfirm} disabled={loading}>
              {alertOptions.confirmText || 'OK'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {renderDialog()}
    </DialogContext.Provider>
  );
};

/**
 * useDialog Hook
 * 
 * @example
 * const dialog = useDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await dialog.confirm({
 *     title: 'Delete Item?',
 *     message: 'This action cannot be undone.',
 *     isDangerous: true,
 *     confirmText: 'Delete',
 *   });
 *   
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 */
export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
};

export default DialogProvider;

