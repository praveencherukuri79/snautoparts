import React from 'react';
import {
  IconButton as MuiIconButton,
  IconButtonProps as MuiIconButtonProps,
  CircularProgress,
} from '@mui/material';
import { Tooltip } from '../Tooltip';

export interface IconButtonProps extends MuiIconButtonProps {
  /** Tooltip text */
  tooltip?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * IconButton Component
 * 
 * Button with icon only, optional tooltip.
 * 
 * @example
 * ```tsx
 * <IconButton tooltip="Delete item" onClick={handleDelete}>
 *   <DeleteIcon />
 * </IconButton>
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  tooltip,
  loading = false,
  disabled,
  children,
  size = 'medium',
  ...props
}) => {
  const button = (
    <MuiIconButton disabled={disabled || loading} size={size} {...props}>
      {loading ? (
        <CircularProgress size={size === 'small' ? 16 : 20} color="inherit" />
      ) : (
        children
      )}
    </MuiIconButton>
  );

  if (tooltip && !disabled && !loading) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
};

IconButton.displayName = 'IconButton';

export default IconButton;
