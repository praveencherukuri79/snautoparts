/**
 * Clickable Card Component
 * 
 * Reusable card component for clickable/linkable items
 * Handles hover states, transitions, and routing
 */

import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, BoxProps } from '@mui/material';

export interface ClickableCardProps extends Omit<BoxProps, 'component'> {
  to?: string;
  onClick?: () => void;
  hoverBg?: string;
}

export const ClickableCard = forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ to, onClick, hoverBg = 'grey.50', children, sx, ...props }, ref) => {
    const Component = to ? RouterLink : 'div';
    const componentProps = to ? { to } : {};

    return (
      <Box
        ref={ref}
        component={Component}
        onClick={onClick}
        className="transition-colors"
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': {
            bgcolor: hoverBg,
          },
          ...sx,
        }}
        {...componentProps}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

ClickableCard.displayName = 'ClickableCard';

export default ClickableCard;

