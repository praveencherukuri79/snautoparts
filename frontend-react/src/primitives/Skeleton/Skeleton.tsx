import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps, Box, Stack } from '@mui/material';

export interface SkeletonProps extends MuiSkeletonProps {
  /** Number of skeleton lines */
  lines?: number;
  /** Gap between lines */
  gap?: number;
}

/**
 * Skeleton Component
 * 
 * Loading placeholder for content.
 * 
 * @example
 * ```tsx
 * <Skeleton variant="rectangular" height={200} />
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circular" width={40} height={40} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  lines = 1,
  gap = 1,
  ...props
}) => {
  if (lines > 1) {
    return (
      <Stack spacing={gap}>
        {Array.from({ length: lines }).map((_, index) => (
          <MuiSkeleton
            key={index}
            animation="wave"
            {...props}
            width={index === lines - 1 ? '60%' : props.width}
          />
        ))}
      </Stack>
    );
  }

  return <MuiSkeleton animation="wave" {...props} />;
};

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton patterns
export const ProductCardSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="40%" />
  </Box>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} variant="text" sx={{ flex: 1 }} />
    ))}
  </Box>
);

export const ListItemSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </Box>
  </Box>
);

export default Skeleton;
