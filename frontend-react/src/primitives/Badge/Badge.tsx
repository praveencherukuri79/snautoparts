import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

export interface BadgeProps extends Omit<MuiChipProps, 'color' | 'variant'> {
  /** Badge style variant */
  variant?: BadgeVariant;
  /** Badge style - filled or outlined */
  filled?: boolean;
}

/**
 * Badge Component
 * 
 * Status indicator or label badge with different color variants.
 * 
 * @example
 * ```tsx
 * <Badge variant="success">In Stock</Badge>
 * <Badge variant="warning">Low Stock</Badge>
 * <Badge variant="error">Out of Stock</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  filled = true,
  size = 'small',
  ...props
}) => {
  const getColor = (): MuiChipProps['color'] => {
    switch (variant) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'primary':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <MuiChip
      color={getColor()}
      variant={filled ? 'filled' : 'outlined'}
      size={size}
      {...props}
    />
  );
};

Badge.displayName = 'Badge';

export default Badge;
