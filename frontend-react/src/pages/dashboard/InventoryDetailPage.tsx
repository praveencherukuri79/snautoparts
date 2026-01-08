// Placeholder page - to be implemented
import React from 'react';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const InventoryDetailPage: React.FC = () => {
  const { id } = useParams();
  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>Product: {id}</Typography>
      <Typography color="text.secondary">This page is under development.</Typography>
    </>
  );
};

export default InventoryDetailPage;
