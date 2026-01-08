/**
 * EmptyState Component
 * 
 * Display when no data is available
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Button } from '@/primitives';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <Box textAlign="center" py={8}>
      <Typography variant="h6" color="text.secondary" mb={actionLabel ? 3 : 0}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;

