import type { Order, OrderItem } from '../../entities/index.js';
import type { TRQOrderRequest, TRQOrderItem, TRQShippingInfo } from './trq.types.js';

/**
 * TRQ Data Mapper
 * 
 * Maps between internal models and TRQ API formats.
 */

/**
 * Map internal order to TRQ order request
 */
export function mapOrderToTRQRequest(
  order: Order,
  items: OrderItem[],
  affiliateSkuMap: Map<string, string>,
): TRQOrderRequest {
  const trqItems: TRQOrderItem[] = items
    .filter((item) => affiliateSkuMap.has(item.product?.id ?? ''))
    .map((item) => ({
      sku: affiliateSkuMap.get(item.product?.id ?? '') ?? item.productSku,
      qty: item.quantity,
      unitCost: parseFloat(item.unitPrice),
    }));

  const shippingAddr = order.shippingAddress as Record<string, string>;

  return {
    poNumber: order.orderNumber,
    items: trqItems,
    shipping: mapShippingInfo(shippingAddr),
  };
}

/**
 * Map address to TRQ shipping info format
 */
function mapShippingInfo(addr: Record<string, string>): TRQShippingInfo {
  return {
    recipientName: `${addr.firstName} ${addr.lastName}`,
    companyName: addr.company,
    addressLine1: addr.address1,
    addressLine2: addr.address2,
    city: addr.city,
    stateProvince: addr.state,
    postalCode: addr.zipCode,
    countryCode: addr.country || 'US',
    phoneNumber: addr.phone,
    shippingMethod: 'ground',
  };
}

