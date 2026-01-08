/**
 * ShopPage Styled Components
 */

import { Box, Paper, styled } from '@mui/material';

export const ProductCard = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

export const ProductImage = styled('img')({
  objectFit: 'cover',
  backgroundColor: '#f5f5f5',
});

export const FilterSidebarPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

export const StrikePrice = styled('span')(({ theme }) => ({
  textDecoration: 'line-through',
  color: theme.palette.text.disabled,
}));
