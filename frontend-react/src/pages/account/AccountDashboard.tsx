import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  DirectionsCar,
  ChevronRight,
  Inventory2,
  Inventory,
  Settings,
  LocationOn,
} from '@mui/icons-material';
import { accountService, type AccountDashboardData } from '@/services/accountService';
import { StatCard, OrderListItem, ActionCard } from '@/components';
import { Avatar } from '@/primitives';
import type { OrderStatus } from '@/models';

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

// Map icon names to MUI icon components
const iconMap = {
  Inventory,
  LocalShipping,
  DirectionsCar,
  Settings,
  Inventory2,
  ShoppingCart,
  LocationOn,
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AccountDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AccountDashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await accountService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <Box bgcolor="background.default" minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={48} />
      </Box>
    );
  }

  const { user, stats, recentOrders, quickActions } = dashboardData;

  const getUserFullName = () => {
    return `${user.firstName} ${user.lastName}`.trim() || 'User';
  };

  // Map stats to display format
  const statsDisplay = [
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: Inventory2, color: 'primary.main' },
    { label: 'Saved Vehicles', value: stats.savedVehicles.toString(), icon: DirectionsCar, color: 'success.main' },
    { label: 'Cart Items', value: stats.cartItems.toString(), icon: ShoppingCart, color: 'warning.main' },
    { label: 'Addresses', value: stats.addresses.toString(), icon: LocationOn, color: 'info.main' },
  ];

  return (
    <Box bgcolor="background.default" minHeight="100vh" py={4}>
      <Box className="container">
        {/* Welcome Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} mb={4}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar
              size="xl"
              name={getUserFullName()}
              sx={{ fontWeight: 700 }}
            />
            <Box>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                Welcome back, {getUserFullName()}
              </Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Box>
          </Stack>
          <Button
            component={RouterLink}
            to="/shop"
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            sx={{ px: 3 }}
          >
            Continue Shopping
          </Button>
        </Stack>

        {/* Stats Grid */}
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={3} mb={4}>
          {statsDisplay.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </Stack>

        {/* Main Content Grid */}
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={3} alignItems="flex-start">
          {/* Recent Orders */}
          <Box flex={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} minHeight={40}>
              <Typography variant="h6" fontWeight={700}>
                Recent Orders
              </Typography>
              <Button
                component={RouterLink}
                to="/account/orders"
                endIcon={<ChevronRight />}
                sx={{ color: 'primary.main' }}
              >
                View All
              </Button>
            </Stack>

            <Box
              bgcolor="background.paper"
              borderRadius={2}
              border={1}
              borderColor="border.light"
              overflow="hidden"
            >
              {recentOrders.length > 0 ? (
                <Stack divider={<Divider />}>
                  {recentOrders.map((order) => {
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
              ) : (
                <Box p={6} textAlign="center">
                  <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary" mb={2}>
                    No orders yet
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/shop"
                    variant="contained"
                    startIcon={<ShoppingCart />}
                  >
                    Start Shopping
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box flex={1}>
            <Box mb={2} minHeight={40} display="flex" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Quick Actions
              </Typography>
            </Box>
            <Stack gap={2}>
              {quickActions.map((action) => {
                const IconComponent = iconMap[action.icon as keyof typeof iconMap];
                return IconComponent ? (
                  <ActionCard
                    key={action.label}
                    label={action.label}
                    description={action.description}
                    icon={IconComponent}
                    color={action.color}
                    to={action.route}
                  />
                ) : null;
              })}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
