import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardActions,
  CardMedia,
  CardHeader,
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Image source URL */
  image?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Image height */
  imageHeight?: number | string;
  /** Actions to display at bottom of card */
  actions?: React.ReactNode;
  /** Whether to add padding to content */
  noPadding?: boolean;
  /** Whether card is clickable (adds hover effect) */
  clickable?: boolean;
  /** Header action element (top right) */
  headerAction?: React.ReactNode;
}

/**
 * Card Component
 * 
 * Content container with optional image, title, and actions.
 * 
 * @example
 * ```tsx
 * <Card
 *   title="Brake Pads"
 *   subtitle="Premium quality"
 *   image="/images/brake-pads.jpg"
 *   actions={<Button>Add to Cart</Button>}
 * >
 *   <Typography>Product description here...</Typography>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  image,
  imageAlt,
  imageHeight = 200,
  actions,
  noPadding = false,
  clickable = false,
  headerAction,
  children,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': clickable
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
            }
          : undefined,
        ...sx,
      }}
      {...props}
    >
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt || title || 'Card image'}
          sx={{ objectFit: 'cover' }}
        />
      )}

      {(title || subtitle || headerAction) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={headerAction}
          titleTypographyProps={{
            variant: 'h6',
            sx: { fontWeight: 600 },
          }}
          subheaderTypographyProps={{
            variant: 'body2',
            color: 'text.secondary',
          }}
        />
      )}

      {children && (
        <CardContent
          sx={{
            flexGrow: 1,
            pt: title || subtitle ? 0 : undefined,
            p: noPadding ? 0 : undefined,
            '&:last-child': noPadding ? { pb: 0 } : undefined,
          }}
        >
          {children}
        </CardContent>
      )}

      {actions && (
        <CardActions sx={{ p: 2, pt: 0 }}>{actions}</CardActions>
      )}
    </MuiCard>
  );
};

Card.displayName = 'Card';

export default Card;
