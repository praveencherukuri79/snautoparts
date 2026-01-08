/**
 * Order Detail Page
 * 
 * Single order view with timeline, items, and shipping info
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { Button, Link } from '@/primitives';
import { orderService } from '@/services';
import type { OrderDetail, OrderTimelineEvent, Shipment, OrderStatus } from '@/models';

// Map order status to display info
const getStatusDisplay = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, { label: string; color: 'success' | 'info' | 'warning' | 'error' | 'default'; icon: typeof CheckCircle }> = {
    DELIVERED: { label: 'Delivered', color: 'success', icon: CheckCircle },
    SHIPPED: { label: 'Shipped', color: 'info', icon: LocalShipping },
    PROCESSING: { label: 'Processing', color: 'warning', icon: AccessTime },
    PENDING: { label: 'Pending', color: 'warning', icon: AccessTime },
    CONFIRMED: { label: 'Confirmed', color: 'info', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'error', icon: CheckCircle },
    REFUNDED: { label: 'Refunded', color: 'default', icon: CheckCircle },
  };
  return statusMap[status] || { label: status, color: 'default' as const, icon: CheckCircle };
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [timeline, setTimeline] = useState<OrderTimelineEvent[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const loadOrderData = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load order data
      const orderData = await orderService.getOrderDetail(orderId);
      const timelineData = await orderService.getOrderTimeline(orderId);
      const shipmentsData = await orderService.getOrderShipments(orderId);

      setOrder(orderData);
      setTimeline(timelineData);
      setShipments(shipmentsData);
    } catch (err: any) {
      console.error('Failed to load order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  if (loading) {
    return (
      <Box bgcolor="background.default" minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box bgcolor="background.default" minHeight="100vh" py={4}>
        <Box className="container">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Order not found'}
          </Alert>
          <Button component={RouterLink} to="/account/orders" startIcon={<ArrowBack />}>
            Back to Orders
          </Button>
        </Box>
      </Box>
    );
  }

  const statusDisplay = getStatusDisplay(order.status);
  const StatusIcon = statusDisplay.icon;

  return (
    <Box bgcolor="background.default" minHeight="100vh" py={4}>
      <Box className="container">
        {/* Back Button */}
        <Button
          component={RouterLink}
          to="/account/orders"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>

        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="text.primary" mb={0.5}>
              {order.orderNumber}
            </Typography>
            <Typography color="text.secondary">
              Placed on {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Chip
            icon={<StatusIcon />}
            label={statusDisplay.label}
            color={statusDisplay.color}
            sx={{ fontWeight: 700, px: 1 }}
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Order Items */}
            <Box
              bgcolor="background.paper"
              borderRadius={2}
              border={1}
              borderColor="border.light"
              mb={3}
            >
              <Box p={3} borderBottom={1} borderColor="border.light">
                <Typography variant="h6" fontWeight={700}>
                  Order Items ({order.items.length})
                </Typography>
              </Box>

              <Stack divider={<Divider />}>
                {order.items.map((item) => (
                  <Stack key={item.id} direction="row" gap={2} p={3}>
                    {/* Product Image */}
                    {item.productImageUrl && (
                      <Box
                        component="img"
                        src={item.productImageUrl}
                        alt={item.productName}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'border.light',
                        }}
                      />
                    )}

                    {/* Product Info */}
                    <Box flex={1}>
                      <Typography fontWeight={600} color="text.primary" mb={0.5}>
                        {item.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        SKU: {item.productSku}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                    </Box>

                    {/* Price */}
                    <Box textAlign="right">
                      <Typography fontWeight={700} color="text.primary">
                        ${parseFloat(item.totalPrice).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${parseFloat(item.unitPrice).toFixed(2)} each
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              {/* Order Summary */}
              <Box p={3} borderTop={1} borderColor="border.light" bgcolor="grey.50">
                <Stack gap={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography fontWeight={600}>${parseFloat(order.subtotal).toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography fontWeight={600}>${parseFloat(order.shippingCost).toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Tax</Typography>
                    <Typography fontWeight={600}>${parseFloat(order.taxAmount).toFixed(2)}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>Total</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      ${parseFloat(order.total).toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>

            {/* Shipment Tracking */}
            {shipments.length > 0 && (
              <Box
                bgcolor="background.paper"
                borderRadius={2}
                border={1}
                borderColor="border.light"
                p={3}
                mb={3}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Shipment Tracking
                </Typography>
                {shipments.map((shipment) => (
                  <Box key={shipment.id}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography fontWeight={600} mb={0.5}>
                          {shipment.carrier}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tracking: {shipment.trackingNumber}
                        </Typography>
                      </Box>
                      {shipment.trackingUrl && (
                        <Link to={shipment.trackingUrl} variant="button-outlined" external>
                          Track Package
                        </Link>
                      )}
                    </Stack>
                    {shipment.estimatedDelivery && (
                      <Typography variant="body2" color="text.secondary">
                        Estimated Delivery: {formatDate(shipment.estimatedDelivery)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Order Timeline */}
            <Box
              bgcolor="background.paper"
              borderRadius={2}
              border={1}
              borderColor="border.light"
              p={3}
              mb={3}
            >
              <Typography variant="h6" fontWeight={700} mb={3}>
                Order Timeline
              </Typography>
              <Stack gap={3}>
                {timeline.map((event, index) => (
                  <Stack key={event.id} direction="row" gap={2}>
                    {/* Timeline Indicator */}
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: index === timeline.length - 1 ? 'primary.main' : 'success.main',
                          border: 2,
                          borderColor: 'background.paper',
                          boxShadow: 1,
                        }}
                      />
                      {index < timeline.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: '50%',
                            top: 12,
                            bottom: -24,
                            width: 2,
                            bgcolor: 'border.light',
                            transform: 'translateX(-50%)',
                          }}
                        />
                      )}
                    </Box>

                    {/* Event Info */}
                    <Box flex={1}>
                      <Typography fontWeight={600} color="text.primary" mb={0.25}>
                        {event.title}
                      </Typography>
                      {event.description && (
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          {event.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {formatDate(event.createdAt)}
                      </Typography>
                      {event.changedBy && (
                        <Typography variant="caption" color="text.disabled" display="block">
                          by {event.changedBy.firstName} {event.changedBy.lastName}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Box
                bgcolor="background.paper"
                borderRadius={2}
                border={1}
                borderColor="border.light"
                p={3}
                mb={3}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Shipping Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(order.shippingAddress as any).firstName} {(order.shippingAddress as any).lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(order.shippingAddress as any).address1}
                </Typography>
                {(order.shippingAddress as any).address2 && (
                  <Typography variant="body2" color="text.secondary">
                    {(order.shippingAddress as any).address2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).zipCode}
                </Typography>
              </Box>
            )}

            {/* Payment Method */}
            {order.paymentMethod && (
              <Box
                bgcolor="background.paper"
                borderRadius={2}
                border={1}
                borderColor="border.light"
                p={3}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Payment Method
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.paymentMethod}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
