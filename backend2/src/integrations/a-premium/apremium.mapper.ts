import type { Order, OrderItem } from '../../entities/index.js';
import type { APremiumOrderRequest, APremiumOrderItem, APremiumAddress } from './apremium.types.js';

/**
 * A-Premium Data Mapper
 * 
 * Maps between internal models and A-Premium API formats.
 */

/**
 * Map internal order to A-Premium order request
 */
export function mapOrderToAPremiumRequest(
  order: Order,
  items: OrderItem[],
  affiliateSkuMap: Map<string, string>,
): APremiumOrderRequest {
  const apremiumItems: APremiumOrderItem[] = items
    .filter((item) => affiliateSkuMap.has(item.product?.id ?? ''))
    .map((item) => ({
      sku: affiliateSkuMap.get(item.product?.id ?? '') ?? item.productSku,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
    }));

  const shippingAddr = order.shippingAddress as Record<string, string>;

  return {
    orderNumber: order.orderNumber,
    items: apremiumItems,
    shippingAddress: mapAddress(shippingAddr),
    billingAddress: order.billingAddress ? mapAddress(order.billingAddress as Record<string, string>) : undefined,
    metadata: {
      internalOrderId: order.id,
    },
  };
}

/**
 * Map address to A-Premium format
 */
function mapAddress(addr: Record<string, string>): APremiumAddress {
  return {
    firstName: addr.firstName,
    lastName: addr.lastName,
    company: addr.company,
    address1: addr.address1,
    address2: addr.address2,
    city: addr.city,
    state: addr.state,
    zipCode: addr.zipCode,
    country: addr.country || 'US',
    phone: addr.phone,
  };
}

