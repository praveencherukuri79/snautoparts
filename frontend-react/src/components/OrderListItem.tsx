/**
 * Order List Item Component
 * 
 * Reusable component for displaying order summary in a list
 */

import { Stack, Typography, Chip, IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { ClickableCard } from './ClickableCard';
import type { OrderStatus } from '@/models';

export interface OrderListItemProps {
  id: string;
  orderNumber: string;
  createdAt: string;
  itemCount: number;
  total: string;
  status: OrderStatus;
  statusLabel: string;
  statusColor: 'success' | 'info' | 'warning' | 'error' | 'default';
  onDateFormat: (date: string) => string;
}

export const OrderListItem: React.FC<OrderListItemProps> = ({
  id,
  orderNumber,
  createdAt,
  itemCount,
  total,
  statusLabel,
  statusColor,
  onDateFormat,
}) => {
  return (
    <ClickableCard
      to={`/account/orders/${id}`}
      p={3}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
      >
        <Stack flex={1} gap={0.5}>
          <Typography fontWeight={600} color="text.primary">
            {orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {onDateFormat(createdAt)} • {itemCount} items
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography fontWeight={700} color="text.primary">
            ${parseFloat(total).toFixed(2)}
          </Typography>
          <Chip
            label={statusLabel}
            color={statusColor}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <IconButton size="small">
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>
    </ClickableCard>
  );
};

export default OrderListItem;

