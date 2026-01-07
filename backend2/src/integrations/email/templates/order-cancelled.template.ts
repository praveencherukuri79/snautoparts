/**
 * Order Cancelled Email Template
 */

import type { OrderCancelledData } from '../email.types.js';
import { wrapInBaseTemplate, components } from './base.template.js';

export function orderCancelledTemplate(data: OrderCancelledData): string {
  const { customerName, orderNumber, reason, refundAmount } = data;

  const content = `
    ${components.heading('Order Cancelled')}
    
    ${components.paragraph(`Hi ${customerName},`)}
    ${components.paragraph(`Your order <strong>${orderNumber}</strong> has been cancelled.`)}
    
    ${reason ? components.infoBox(`
      <p style="margin: 0;"><strong style="color: #111827;">Reason:</strong></p>
      <p style="margin: 8px 0 0; color: #4b5563;">${reason}</p>
    `) : ''}
    
    ${refundAmount ? components.successBox(`
      <p style="margin: 0; color: #065f46;">
        <strong>Refund Amount: $${refundAmount}</strong><br>
        <span style="font-size: 14px;">This will be credited back to your original payment method within 5-10 business days.</span>
      </p>
    `) : ''}
    
    ${components.divider()}
    
    ${components.paragraph(`If you have any questions about this cancellation, please don't hesitate to contact our support team.`)}
    
    ${components.paragraph(`We hope to serve you again soon.`)}
  `;

  return wrapInBaseTemplate({
    title: `Order Cancelled - ${orderNumber}`,
    preheader: `Your order ${orderNumber} has been cancelled.`,
    content,
  });
}

