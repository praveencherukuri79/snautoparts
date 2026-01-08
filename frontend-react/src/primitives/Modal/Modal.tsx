import React from 'react';
import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullWidth';

export interface ModalProps extends Omit<MuiDialogProps, 'maxWidth'> {
  /** Modal title */
  title?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Modal size */
  size?: ModalSize;
  /** Actions to display at bottom */
  actions?: React.ReactNode;
  /** Callback when close button is clicked */
  onClose?: () => void;
}

/**
 * Modal Component
 * 
 * Dialog/Modal with title, content, and actions.
 * 
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Delete"
 *   actions={
 *     <>
 *       <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
 *       <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *     </>
 *   }
 * >
 *   <Typography>Are you sure you want to delete this item?</Typography>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  title,
  showCloseButton = true,
  size = 'sm',
  actions,
  onClose,
  children,
  ...props
}) => {
  const maxWidth = size === 'fullWidth' ? false : size;

  return (
    <MuiDialog
      maxWidth={maxWidth}
      fullWidth
      onClose={onClose}
      {...props}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: showCloseButton ? 6 : undefined,
          }}
        >
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {showCloseButton && onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent dividers={Boolean(actions)}>{children}</DialogContent>

      {actions && (
        <DialogActions sx={{ p: 2, gap: 1 }}>{actions}</DialogActions>
      )}
    </MuiDialog>
  );
};

Modal.displayName = 'Modal';

export default Modal;
