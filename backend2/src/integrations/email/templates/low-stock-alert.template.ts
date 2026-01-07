/**
 * Low Stock Alert Email Template
 */

import type { LowStockAlertData } from '../email.types.js';
import { wrapInBaseTemplate, components } from './base.template.js';

export function lowStockAlertTemplate(data: LowStockAlertData): string {
  const { alerts, totalAlerts } = data;

  const alertsHtml = alerts.map(alert => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <span style="font-family: monospace; color: #4b5563;">${alert.sku}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${alert.name}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; ${
          alert.currentQuantity === 0
            ? 'background-color: #fef2f2; color: #dc2626;'
            : 'background-color: #fffbeb; color: #d97706;'
        }">
          ${alert.currentQuantity}
        </span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${alert.threshold}</td>
    </tr>
  `).join('');

  const outOfStock = alerts.filter(a => a.currentQuantity === 0).length;
  const lowStock = alerts.length - outOfStock;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 56px;">⚠️</span>
    </div>
    
    ${components.heading('Low Stock Alert')}
    
    ${components.paragraph(`The following ${totalAlerts} product${totalAlerts === 1 ? '' : 's'} need${totalAlerts === 1 ? 's' : ''} your attention:`)}
    
    <!-- Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        ${outOfStock > 0 ? `
        <td style="text-align: center; padding: 16px;">
          <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px;">
            <div style="font-size: 32px; font-weight: 700; color: #dc2626;">${outOfStock}</div>
            <div style="color: #991b1b; font-size: 13px; margin-top: 4px;">Out of Stock</div>
          </div>
        </td>
        ` : ''}
        ${lowStock > 0 ? `
        <td style="text-align: center; padding: 16px;">
          <div style="background-color: #fffbeb; border-radius: 8px; padding: 16px;">
            <div style="font-size: 32px; font-weight: 700; color: #d97706;">${lowStock}</div>
            <div style="color: #92400e; font-size: 13px; margin-top: 4px;">Low Stock</div>
          </div>
        </td>
        ` : ''}
      </tr>
    </table>
    
    <!-- Alerts Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 24px 0;">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase;">SKU</th>
          <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase;">Product</th>
          <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase;">Current Qty</th>
          <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase;">Threshold</th>
        </tr>
      </thead>
      <tbody>
        ${alertsHtml}
      </tbody>
    </table>
    
    ${components.warningBox(`
      <p style="margin: 0; color: #92400e;">
        <strong>Action Required:</strong> Please restock these items to avoid stockouts and potential lost sales.
      </p>
    `)}
  `;

  return wrapInBaseTemplate({
    title: `Low Stock Alert - ${totalAlerts} Product${totalAlerts === 1 ? '' : 's'}`,
    preheader: `${totalAlerts} product${totalAlerts === 1 ? '' : 's'} need${totalAlerts === 1 ? 's' : ''} restocking`,
    content,
  });
}

