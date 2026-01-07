import type { Order, OrderItem } from '../../entities/index.js';
import type { BuyAutoPartsOrderRequest, BuyAutoPartsLineItem, BuyAutoPartsAddress } from './buyautoparts.types.js';

/**
 * BuyAutoParts Data Mapper
 * 
 * Maps between internal models and BuyAutoParts API formats.
 */

/**
 * Map internal order to BuyAutoParts order request
 */
export function mapOrderToBuyAutoPartsRequest(
  order: Order,
  items: OrderItem[],
  affiliateSkuMap: Map<string, string>,
): BuyAutoPartsOrderRequest {
  const lineItems: BuyAutoPartsLineItem[] = items
    .filter((item) => affiliateSkuMap.has(item.product?.id ?? ''))
    .map((item) => ({
      partNumber: affiliateSkuMap.get(item.product?.id ?? '') ?? item.productSku,
      quantity: item.quantity,
      price: parseFloat(item.unitPrice),
    }));

  const shippingAddr = order.shippingAddress as Record<string, string>;

  return {
    referenceNumber: order.orderNumber,
    lineItems,
    shipTo: mapAddress(shippingAddr),
    billTo: order.billingAddress ? mapAddress(order.billingAddress as Record<string, string>) : undefined,
  };
}

/**
 * Map address to BuyAutoParts format
 */
function mapAddress(addr: Record<string, string>): BuyAutoPartsAddress {
  return {
    name: `${addr.firstName} ${addr.lastName}`,
    company: addr.company,
    street1: addr.address1,
    street2: addr.address2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.zipCode,
    country: addr.country || 'US',
    phone: addr.phone,
  };
}

