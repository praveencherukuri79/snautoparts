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
    if (to) {
      return (
        <Box
          ref={ref as any}
          component={RouterLink as any}
          to={to}
          onClick={onClick}
          className="transition-colors"
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'block',
            color: 'inherit',
            '&:hover': {
              bgcolor: hoverBg,
            },
            ...sx,
          }}
          {...props}
        >
          {children}
        </Box>
      );
    }

    return (
      <Box
        ref={ref}
        onClick={onClick}
        className="transition-colors"
        sx={{
          cursor: 'pointer',
          '&:hover': {
            bgcolor: hoverBg,
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

ClickableCard.displayName = 'ClickableCard';

export default ClickableCard;

