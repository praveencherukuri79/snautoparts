import { forwardRef } from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';
import type { LinkProps } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

// Base props without component/to - used when rendering as button
type BaseButtonProps = Omit<MuiButtonProps, 'variant' | 'color'> & {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
};

// Props when used with react-router Link
type LinkButtonProps = BaseButtonProps & {
  component: typeof import('react-router-dom').Link;
  to: LinkProps['to'];
};

// Union type supporting both regular button and link button
export type ButtonProps = BaseButtonProps | LinkButtonProps;

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
