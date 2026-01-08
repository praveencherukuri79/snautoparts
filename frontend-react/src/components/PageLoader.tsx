/**
 * PageLoader Component
 * 
 * Full-page loading spinner for async page loads
 */

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export interface PageLoaderProps {
  minHeight?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ minHeight = '100vh' }) => {
  return (
    <Box
      bgcolor="background.default"
      minHeight={minHeight}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress size={48} />
    </Box>
  );
};

export default PageLoader;

