/**
 * ErrorState Component
 * 
 * Display error messages with optional action
 */

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Button } from '@/primitives';

export interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <Box bgcolor="background.default" minHeight="100vh">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="error" textAlign="center" mb={actionLabel ? 3 : 0}>
          {message}
        </Typography>
        {actionLabel && onAction && (
          <Box textAlign="center">
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ErrorState;

