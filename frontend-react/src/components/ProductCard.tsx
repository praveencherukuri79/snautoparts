/**
 * ProductCard Component
 * 
 * Reusable product card for displaying product summary
 * Used across Shop, Category, Deals pages
 */

import React from 'react';
import { Box, Stack, Typography, styled } from '@mui/material';
import { Button, Card } from '@/primitives';
import type { ProductSummary } from '@/models';
import { IMAGES } from '@/config/images';

const StyledCard = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
});

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 200,
  objectFit: 'cover',
  backgroundColor: theme.palette.grey[100],
}));

const StrikePrice = styled('span')(({ theme }) => ({
  textDecoration: 'line-through',
  color: theme.palette.text.disabled,
}));

export interface ProductCardProps {
  product: ProductSummary;
  priceColor?: string;
  onAddToCart?: (product: ProductSummary) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  priceColor,
  onAddToCart,
}) => {
  return (
    <Card>
      <StyledCard>
        {/* Product Image */}
        <ProductImage
          src={product.imageUrl || IMAGES.hero.engine}
          alt={product.name}
        />

        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* SKU */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            {product.sku}
          </Typography>

          {/* Product Name */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1, flex: 1 }}>
            {product.name}
          </Typography>

          {/* Pricing */}
          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              color={priceColor || (product.compareAtPrice ? 'error.main' : 'text.primary')}
            >
              ${parseFloat(product.price).toFixed(2)}
            </Typography>
            {product.compareAtPrice && (
              <Typography variant="body2" component="span">
                <StrikePrice>${parseFloat(product.compareAtPrice).toFixed(2)}</StrikePrice>
              </Typography>
            )}
          </Stack>

          {/* Stock Status */}
          <Typography
            variant="body2"
            color={product.stockQuantity > 0 ? 'success.main' : 'error.main'}
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
          </Typography>

          {/* Actions */}
          <Button
            fullWidth
            variant="primary"
            disabled={product.stockQuantity === 0}
            onClick={() => onAddToCart?.(product)}
          >
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
          </Button>
        </Box>
      </StyledCard>
    </Card>
  );
};

export default ProductCard;

