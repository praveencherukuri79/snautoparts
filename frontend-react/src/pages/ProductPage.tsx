// Placeholder page - to be implemented
import React from 'react';
import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const ProductPage: React.FC = () => {
  const { id } = useParams();
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>Product: {id}</Typography>
      <Typography color="text.secondary">This page is under development.</Typography>
    </Container>
  );
};

export default ProductPage;
