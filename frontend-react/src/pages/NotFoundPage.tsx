import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Button, EmptyState } from '@/primitives';
import { useNavigate } from 'react-router-dom';

/**
 * NotFoundPage Component
 * 
 * 404 error page displayed when route is not found.
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <EmptyState
        icon={
          <Typography variant="h1" sx={{ fontSize: '6rem', color: 'text.disabled' }}>
            404
          </Typography>
        }
        title="Page Not Found"
        description="Sorry, we couldn't find the page you're looking for. The page might have been removed, had its name changed, or is temporarily unavailable."
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go Home
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Box>
        }
      />
    </Container>
  );
};

export default NotFoundPage;
