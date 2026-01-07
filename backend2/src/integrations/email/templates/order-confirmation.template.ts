/**
 * Order Confirmation Email Template
 */

import type { OrderConfirmationData } from '../email.types.js';
import { wrapInBaseTemplate, components } from './base.template.js';

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const { customerName, orderNumber, orderDate, items, subtotal, shipping, tax, total, shippingAddress } = data;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #111827;">${item.name}</strong><br>
        <span style="color: #6b7280; font-size: 13px;">SKU: ${item.sku}</span>
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantity}</td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #4b5563;">$${item.unitPrice}</td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 500;">$${item.totalPrice}</td>
    </tr>
  `).join('');

  const content = `
    ${components.heading('Thank You for Your Order!')}
    
    ${components.paragraph(`Hi ${customerName},`)}
    ${components.paragraph(`We've received your order and it's being processed. We'll send you a shipping confirmation once it's on its way.`)}
    
    ${components.infoBox(`
      <p style="margin: 0 0 8px;"><strong style="color: #111827;">Order Number:</strong> <span style="color: #4b5563;">${orderNumber}</span></p>
      <p style="margin: 0;"><strong style="color: #111827;">Order Date:</strong> <span style="color: #4b5563;">${orderDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
    `)}
    
    <!-- Order Items Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 24px 0;">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 14px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px; text-transform: uppercase;">Item</th>
          <th style="padding: 14px 16px; text-align: center; font-weight: 600; color: #374151; font-size: 13px; text-transform: uppercase;">Qty</th>
          <th style="padding: 14px 16px; text-align: right; font-weight: 600; color: #374151; font-size: 13px; text-transform: uppercase;">Price</th>
          <th style="padding: 14px 16px; text-align: right; font-weight: 600; color: #374151; font-size: 13px; text-transform: uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <!-- Order Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
        <td style="padding: 8px 0; text-align: right; color: #4b5563;">$${subtotal}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
        <td style="padding: 8px 0; text-align: right; color: #4b5563;">$${shipping}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Tax</td>
        <td style="padding: 8px 0; text-align: right; color: #4b5563;">$${tax}</td>
      </tr>
      <tr style="border-top: 2px solid #111827;">
        <td style="padding: 16px 0 0; font-size: 18px; font-weight: 600; color: #111827;">Total</td>
        <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 600; color: #111827;">$${total}</td>
      </tr>
    </table>
    
    ${components.divider()}
    
    <!-- Shipping Address -->
    <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px; font-weight: 600;">Shipping Address</h3>
    ${components.infoBox(`
      <p style="margin: 0; color: #4b5563; line-height: 1.6;">
        ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
        ${shippingAddress.address1}<br>
        ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ''}
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
        ${shippingAddress.country}
      </p>
    `)}
    
    ${components.paragraph(`We'll send you another email with tracking information once your order ships.`)}
  `;

  return wrapInBaseTemplate({
    title: `Order Confirmation - ${orderNumber}`,
    preheader: `Thank you for your order ${orderNumber}. We're processing it now.`,
    content,
  });
}

