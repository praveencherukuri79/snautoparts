/**
 * Link Primitive
 * 
 * Reusable link component with consistent styling and variants
 */

import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled, SxProps, Theme } from '@mui/material';

// Styled RouterLink that accepts sx prop and MUI theme
const StyledRouterLink = styled(RouterLink)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-block',
});

// Styled anchor tag that accepts sx prop and MUI theme
const StyledAnchor = styled('a')({
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-block',
});

export type LinkVariant = 'default' | 'button' | 'button-outlined' | 'unstyled';

export interface LinkProps {
  /** Link destination (react-router path or external URL) */
  to: string;
  /** Link variant style */
  variant?: LinkVariant;
  /** External link (opens in new tab) */
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional styles */
  sx?: SxProps<Theme>;
  /** Additional CSS class */
  className?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Children */
  children: React.ReactNode;
}

/**
 * Link Component
 * 
 * Unified link component that handles both internal (react-router) and external links.
 * Supports multiple variants for different use cases.
 * 
 * @example
 * ```tsx
 * <Link to="/shop">Shop Now</Link>
 * <Link to="/track" variant="button">Track Order</Link>
 * <Link to="https://example.com" external>External</Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, variant = 'default', external = false, disabled = false, children, sx, ...props }, ref) => {
    const isExternal = external || to.startsWith('http');

    const getVariantStyles = (): SxProps<Theme> => {
      const baseStyles: SxProps<Theme> = {
        textDecoration: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? ('none' as const) : ('auto' as const),
      };

      switch (variant) {
        case 'button':
          return {
            ...baseStyles,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'common.white',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-1px)',
            },
          };

        case 'button-outlined':
          return {
            ...baseStyles,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 1,
            border: 1,
            borderColor: 'primary.main',
            color: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'primary.light',
            },
          };

        case 'unstyled':
          return baseStyles;

        case 'default':
        default:
          return {
            ...baseStyles,
            color: 'primary.main',
            '&:hover': {
              textDecoration: 'underline',
            },
          };
      }
    };

    const combinedSx = [getVariantStyles(), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])];

    if (isExternal) {
      return (
        <StyledAnchor
          ref={ref as any}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          sx={combinedSx}
          {...props}
        >
          {children}
        </StyledAnchor>
      );
    }

    return (
      <StyledRouterLink
        ref={ref as any}
        to={to}
        sx={combinedSx}
        {...props}
      >
        {children}
      </StyledRouterLink>
    );
  }
);

Link.displayName = 'Link';

export default Link;

