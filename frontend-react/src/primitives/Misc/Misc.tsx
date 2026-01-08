import React from 'react';
import { Box, Typography, Divider as MuiDivider, DividerProps as MuiDividerProps } from '@mui/material';

export interface DividerProps extends MuiDividerProps {
  /** Text to display in divider */
  label?: string;
}

/**
 * Divider Component
 * 
 * Horizontal divider with optional text label.
 * 
 * @example
 * ```tsx
 * <Divider />
 * <Divider label="OR" />
 * ```
 */
export const Divider: React.FC<DividerProps> = ({ label, ...props }) => {
  if (label) {
    return (
      <MuiDivider {...props}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
          {label}
        </Typography>
      </MuiDivider>
    );
  }

  return <MuiDivider {...props} />;
};

Divider.displayName = 'Divider';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
}

/**
 * EmptyState Component
 * 
 * Placeholder for empty content areas.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<ShoppingCartIcon />}
 *   title="Your cart is empty"
 *   description="Add some products to get started"
 *   action={<Button>Shop Now</Button>}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
      }}
    >
      {icon && (
        <Box
          sx={{
            mb: 2,
            color: 'text.secondary',
            '& svg': { fontSize: 64 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: action ? 3 : 0, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
};

EmptyState.displayName = 'EmptyState';

export default Divider;
