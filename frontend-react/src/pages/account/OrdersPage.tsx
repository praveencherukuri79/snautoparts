/**
 * Orders Page
 * 
 * Order history with filters and search
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Inventory2,
  Search,
  ShoppingCart,
} from '@mui/icons-material';
import { Input, Link } from '@/primitives';
import { OrderListItem } from '@/components';
import { orderService } from '@/services';
import type { OrderSummary, OrderStatus } from '@/models';

// Status filter tabs
const STATUS_FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

// Map order status to display info
const getStatusDisplay = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, { label: string; color: 'success' | 'info' | 'warning' | 'error' | 'default' }> = {
    DELIVERED: { label: 'Delivered', color: 'success' },
    SHIPPED: { label: 'Shipped', color: 'info' },
    PROCESSING: { label: 'Processing', color: 'warning' },
    PENDING: { label: 'Pending', color: 'warning' },
    CONFIRMED: { label: 'Confirmed', color: 'info' },
    CANCELLED: { label: 'Cancelled', color: 'error' },
    REFUNDED: { label: 'Refunded', color: 'default' },
  };
  return statusMap[status] || { label: status, color: 'default' as const };
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { orders: data } = await orderService.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search query (order number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = (_event: React.SyntheticEvent, newValue: OrderStatus | 'ALL') => {
    setSelectedStatus(newValue);
  };

  if (loading) {
    return (
      <Box bgcolor="background.default" minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box bgcolor="background.default" minHeight="100vh" py={4}>
      <Box className="container">
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={2} mb={4}>
          <Box
            sx={{
              bgcolor: 'info.light',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
            }}
          >
            <Inventory2 sx={{ fontSize: 28, color: 'info.main' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={900} color="text.primary">
              Order History
            </Typography>
            <Typography color="text.secondary">
              View and track all your orders
            </Typography>
          </Box>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box
          bgcolor="background.paper"
          borderRadius={2}
          border={1}
          borderColor="border.light"
          mb={3}
        >
          {/* Status Tabs */}
          <Box borderBottom={1} borderColor="border.light">
            <Tabs
              value={selectedStatus}
              onChange={handleStatusChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 56,
                },
              }}
            >
              {STATUS_FILTERS.map(filter => (
                <Tab
                  key={filter.value}
                  label={filter.label}
                  value={filter.value}
                />
              ))}
            </Tabs>
          </Box>

          {/* Search */}
          <Box p={3}>
            <Input
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<Search sx={{ color: 'text.disabled' }} />}
              fullWidth
            />
          </Box>
        </Box>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <Box
            bgcolor="background.paper"
            borderRadius={2}
            border={1}
            borderColor="border.light"
            overflow="hidden"
          >
            <Stack divider={<Divider />}>
              {filteredOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                return (
                  <OrderListItem
                    key={order.id}
                    id={order.id}
                    orderNumber={order.orderNumber}
                    createdAt={order.createdAt}
                    itemCount={order.itemCount}
                    total={order.total}
                    status={order.status}
                    statusLabel={statusDisplay.label}
                    statusColor={statusDisplay.color}
                    onDateFormat={formatDate}
                  />
                );
              })}
            </Stack>
          </Box>
        ) : (
          <Box
            bgcolor="background.paper"
            borderRadius={2}
            border={1}
            borderColor="border.light"
            p={8}
            textAlign="center"
          >
            <Inventory2 sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </Typography>
            <Typography color="text.secondary" mb={3}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start shopping to see your orders here'}
            </Typography>
            {!searchQuery && (
              <Link to="/shop" variant="button" sx={{ gap: 1, px: 3, py: 1.5 }}>
                <ShoppingCart />
                Start Shopping
              </Link>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
