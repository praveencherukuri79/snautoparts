/**
 * Order Shipped Email Template
 */

import type { OrderShippedData } from '../email.types.js';
import { wrapInBaseTemplate, components } from './base.template.js';

export function orderShippedTemplate(data: OrderShippedData): string {
  const { customerName, orderNumber, shipments } = data;

  const shipmentsHtml = shipments.map(shipment => `
    <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 12px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom: 12px;">
            <strong style="color: #065f46;">Carrier:</strong>
            <span style="color: #047857; margin-left: 8px;">${shipment.carrier}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px;">
            <strong style="color: #065f46;">Tracking Number:</strong>
            <span style="color: #047857; margin-left: 8px; font-family: monospace;">${shipment.trackingNumber}</span>
          </td>
        </tr>
        ${shipment.estimatedDelivery ? `
        <tr>
          <td style="padding-bottom: 12px;">
            <strong style="color: #065f46;">Estimated Delivery:</strong>
            <span style="color: #047857; margin-left: 8px;">${shipment.estimatedDelivery.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </td>
        </tr>
        ` : ''}
        ${shipment.trackingUrl ? `
        <tr>
          <td>
            <a href="${shipment.trackingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #059669; color: #ffffff; border-radius: 6px; font-weight: 500; text-decoration: none;">Track Package →</a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
  `).join('');

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 56px;">📦</span>
    </div>
    
    ${components.heading('Your Order Has Shipped!')}
    
    ${components.paragraph(`Hi ${customerName},`)}
    ${components.paragraph(`Great news! Your order <strong>${orderNumber}</strong> is on its way to you.`)}
    
    <h3 style="color: #111827; margin: 24px 0 12px; font-size: 18px; font-weight: 600;">Tracking Information</h3>
    ${shipmentsHtml}
    
    ${components.divider()}
    
    <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px; font-weight: 600;">What's Next?</h3>
    <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
      <li>Use the tracking link above to monitor your package</li>
      <li>Ensure someone is available to receive the delivery</li>
      <li>Check your package upon delivery for any damage</li>
    </ul>
    
    ${components.paragraph('')}
    ${components.paragraph(`Thank you for shopping with us!`)}
  `;

  return wrapInBaseTemplate({
    title: `Your Order Has Shipped - ${orderNumber}`,
    preheader: `Your order ${orderNumber} is on its way!`,
    content,
  });
}

