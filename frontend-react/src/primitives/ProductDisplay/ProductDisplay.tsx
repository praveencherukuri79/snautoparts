import React from 'react';
import { Box, Typography } from '@mui/material';

export interface PriceDisplayProps {
  /** Original price */
  price: number;
  /** Sale/discounted price */
  salePrice?: number;
  /** Currency code */
  currency?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout direction */
  direction?: 'row' | 'column';
}

/**
 * PriceDisplay Component
 * 
 * Displays product price with optional sale price.
 * 
 * @example
 * ```tsx
 * <PriceDisplay price={99.99} />
 * <PriceDisplay price={99.99} salePrice={79.99} />
 * ```
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  salePrice,
  currency = 'USD',
  size = 'medium',
  direction = 'row',
}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  const fontSizeMap = {
    small: { main: '0.875rem', strike: '0.75rem' },
    medium: { main: '1.125rem', strike: '0.875rem' },
    large: { main: '1.5rem', strike: '1rem' },
  };

  const hasSale = salePrice !== undefined && salePrice < price;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        alignItems: direction === 'row' ? 'baseline' : 'flex-start',
        gap: direction === 'row' ? 1 : 0.5,
      }}
    >
      {hasSale && (
        <Typography
          sx={{
            fontSize: fontSizeMap[size].strike,
            color: 'text.secondary',
            textDecoration: 'line-through',
          }}
        >
          {formatter.format(price)}
        </Typography>
      )}
      <Typography
        sx={{
          fontSize: fontSizeMap[size].main,
          fontWeight: 600,
          color: hasSale ? 'error.main' : 'text.primary',
        }}
      >
        {formatter.format(hasSale ? salePrice! : price)}
      </Typography>
      {hasSale && (
        <Typography
          component="span"
          sx={{
            fontSize: fontSizeMap[size].strike,
            color: 'success.main',
            fontWeight: 500,
          }}
        >
          ({Math.round(((price - salePrice!) / price) * 100)}% off)
        </Typography>
      )}
    </Box>
  );
};

PriceDisplay.displayName = 'PriceDisplay';

export interface StockIndicatorProps {
  /** Current stock quantity */
  quantity: number;
  /** Low stock threshold */
  lowStockThreshold?: number;
  /** Whether to show quantity number */
  showQuantity?: boolean;
}

/**
 * StockIndicator Component
 * 
 * Shows stock availability status.
 * 
 * @example
 * ```tsx
 * <StockIndicator quantity={50} />
 * <StockIndicator quantity={3} lowStockThreshold={5} />
 * <StockIndicator quantity={0} />
 * ```
 */
export const StockIndicator: React.FC<StockIndicatorProps> = ({
  quantity,
  lowStockThreshold = 10,
  showQuantity = false,
}) => {
  const getStatus = () => {
    if (quantity <= 0) return { label: 'Out of Stock', color: 'error.main' };
    if (quantity <= lowStockThreshold)
      return { label: `Low Stock${showQuantity ? ` (${quantity})` : ''}`, color: 'warning.main' };
    return { label: `In Stock${showQuantity ? ` (${quantity})` : ''}`, color: 'success.main' };
  };

  const status = getStatus();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: status.color,
        }}
      />
      <Typography variant="body2" sx={{ color: status.color, fontWeight: 500 }}>
        {status.label}
      </Typography>
    </Box>
  );
};

StockIndicator.displayName = 'StockIndicator';

export interface RatingDisplayProps {
  /** Rating value (0-5) */
  value: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Size variant */
  size?: 'small' | 'medium';
}

/**
 * RatingDisplay Component
 * 
 * Displays star rating with review count.
 * 
 * @example
 * ```tsx
 * <RatingDisplay value={4.5} reviewCount={128} />
 * ```
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  value,
  reviewCount,
  size = 'medium',
}) => {
  const starSize = size === 'small' ? 16 : 20;
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      const isFull = i < fullStars;
      const isHalf = i === fullStars && hasHalfStar;

      stars.push(
        <Box
          key={i}
          component="span"
          sx={{
            color: isFull || isHalf ? '#f59e0b' : '#d1d5db',
            fontSize: starSize,
            lineHeight: 1,
          }}
        >
          {isFull ? '★' : isHalf ? '★' : '☆'}
        </Box>
      );
    }
    return stars;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ display: 'flex' }}>{renderStars()}</Box>
      <Typography
        variant="body2"
        sx={{ fontSize, color: 'text.secondary', ml: 0.5 }}
      >
        {value.toFixed(1)}
        {reviewCount !== undefined && ` (${reviewCount})`}
      </Typography>
    </Box>
  );
};

RatingDisplay.displayName = 'RatingDisplay';

export default PriceDisplay;
