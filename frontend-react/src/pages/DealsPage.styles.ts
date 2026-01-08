/**
 * DealsPage Styled Components
 */

import { Box, styled } from '@mui/material';

export const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f97316 0%, #d97706 100%)',
  color: theme.palette.common.white,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));

export const DiscountBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 1,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
  borderRadius: theme.shape.borderRadius,
  fontWeight: 700,
  fontSize: '0.875rem',
}));

export const DealCard = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

export const ProductImage = styled('img')({
  width: '100%',
  height: 200,
  objectFit: 'cover',
  backgroundColor: '#f5f5f5',
});

export const StrikePrice = styled('span')(({ theme }) => ({
  textDecoration: 'line-through',
  color: theme.palette.text.disabled,
}));
