/**
 * CategoriesPage Styled Components
 */

import { Box, styled } from '@mui/material';

export const CategoryCard = styled(Box)({
  position: 'relative',
  height: 250,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '&:hover .category-overlay': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export const CategoryImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const CategoryOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4))',
  transition: 'background-color 0.3s',
}));

