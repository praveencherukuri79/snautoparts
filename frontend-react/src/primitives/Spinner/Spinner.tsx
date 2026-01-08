import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Text to display below spinner */
  text?: string;
  /** Whether to display as full page overlay */
  fullPage?: boolean;
  /** Color of the spinner */
  color?: 'primary' | 'secondary' | 'inherit';
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 20,
  md: 40,
  lg: 60,
};

/**
 * Spinner Component
 * 
 * Loading indicator with optional text and full page mode.
 * 
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" text="Loading products..." />
 * <Spinner fullPage text="Please wait..." />
 * ```
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  text,
  fullPage = false,
  color = 'primary',
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={sizeMap[size]} color={color} />
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

Spinner.displayName = 'Spinner';

export default Spinner;
