/**
 * Password Reset Email Template
 */

import type { PasswordResetData } from '../email.types.js';
import { wrapInBaseTemplate, components } from './base.template.js';

export function passwordResetTemplate(data: PasswordResetData): string {
  const { customerName, resetUrl, expiresIn } = data;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 56px;">🔐</span>
    </div>
    
    ${components.heading('Reset Your Password')}
    
    ${components.paragraph(`Hi ${customerName},`)}
    ${components.paragraph(`We received a request to reset your password. Click the button below to create a new password:`)}
    
    <div style="text-align: center; margin: 32px 0;">
      ${components.button('Reset Password', resetUrl)}
    </div>
    
    ${components.warningBox(`
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>This link will expire in ${expiresIn}.</strong><br>
        If you didn't request this, you can safely ignore this email.
      </p>
    `)}
    
    ${components.divider()}
    
    <p style="color: #6b7280; font-size: 13px; margin: 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #1a1a2e; word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  return wrapInBaseTemplate({
    title: 'Reset Your Password',
    preheader: 'Use this link to reset your password. It expires in ' + expiresIn + '.',
    content,
  });
}

