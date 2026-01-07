/**
 * Welcome Email Template
 */

import type { WelcomeData } from '../email.types.js';
import { wrapInBaseTemplate, components } from './base.template.js';

export function welcomeTemplate(data: WelcomeData): string {
  const { customerName, loginUrl } = data;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 56px;">🎉</span>
    </div>
    
    ${components.heading('Welcome to SN Auto Parts!')}
    
    ${components.paragraph(`Hi ${customerName},`)}
    ${components.paragraph(`Thank you for creating an account with us. We're excited to have you as part of the SN Auto Parts family!`)}
    
    ${components.successBox(`
      <p style="margin: 0; color: #065f46;">
        <strong>Your account is ready!</strong><br>
        Start shopping for quality auto parts today.
      </p>
    `)}
    
    <div style="text-align: center; margin: 32px 0;">
      ${components.button('Start Shopping', loginUrl)}
    </div>
    
    ${components.divider()}
    
    <h3 style="color: #111827; margin: 0 0 16px; font-size: 16px; font-weight: 600;">Why Shop With Us?</h3>
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 12px 0; vertical-align: top;">
          <span style="font-size: 24px; margin-right: 12px;">✓</span>
        </td>
        <td style="padding: 12px 0;">
          <strong style="color: #111827;">Guaranteed Fitment</strong>
          <p style="color: #6b7280; margin: 4px 0 0; font-size: 14px;">Every part is verified to fit your vehicle</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; vertical-align: top;">
          <span style="font-size: 24px; margin-right: 12px;">✓</span>
        </td>
        <td style="padding: 12px 0;">
          <strong style="color: #111827;">Free Shipping</strong>
          <p style="color: #6b7280; margin: 4px 0 0; font-size: 14px;">On orders over $99</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; vertical-align: top;">
          <span style="font-size: 24px; margin-right: 12px;">✓</span>
        </td>
        <td style="padding: 12px 0;">
          <strong style="color: #111827;">Expert Support</strong>
          <p style="color: #6b7280; margin: 4px 0 0; font-size: 14px;">Our team is here to help you find the right parts</p>
        </td>
      </tr>
    </table>
  `;

  return wrapInBaseTemplate({
    title: 'Welcome to SN Auto Parts',
    preheader: 'Your account is ready. Start shopping for quality auto parts today!',
    content,
  });
}

