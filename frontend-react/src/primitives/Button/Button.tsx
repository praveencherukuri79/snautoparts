import React, { forwardRef } from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * Primary UI button with multiple variants matching the design system.
 * 
 * @example
 * ```tsx
 * <Button variant="primary">Shop Now</Button>
 * <Button variant="outlined" loading>Loading...</Button>
 * <Button variant="danger" size="small">Delete</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled,
      children,
      startIcon,
      ...props
    },
    ref
  ) => {
    // Map custom variants to MUI variants and colors
    const getMuiVariant = (): MuiButtonProps['variant'] => {
      switch (variant) {
        case 'text':
          return 'text';
        case 'outlined':
          return 'outlined';
        default:
          return 'contained';
      }
    };

    const getMuiColor = (): MuiButtonProps['color'] => {
      switch (variant) {
        case 'danger':
          return 'error';
        case 'secondary':
          return 'secondary';
        default:
          return 'primary';
      }
    };

    return (
      <MuiButton
        ref={ref}
        variant={getMuiVariant()}
        color={getMuiColor()}
        size={size}
        disabled={disabled || loading}
        startIcon={
          loading ? (
            <CircularProgress size={size === 'small' ? 16 : 20} color="inherit" />
          ) : (
            startIcon
          )
        }
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
