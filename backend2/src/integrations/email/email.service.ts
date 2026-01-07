/**
 * Email Service
 * 
 * High-level service for sending transactional emails.
 * Uses the ResendClient for delivery and templates for content.
 */

import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import { ResendClient } from './email.client.js';
import {
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderCancelledTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  lowStockAlertTemplate,
} from './templates/index.js';
import type {
  OrderConfirmationData,
  OrderShippedData,
  OrderCancelledData,
  PasswordResetData,
  WelcomeData,
  LowStockAlertData,
  SendEmailResult,
} from './email.types.js';

export class EmailService {
  private client: ResendClient;

  constructor() {
    this.client = new ResendClient({
      apiKey: config.email.apiKey,
      fromEmail: config.email.fromEmail,
      fromName: 'SN Auto Parts',
    });
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string,
    data: OrderConfirmationData,
  ): Promise<SendEmailResult> {
    const html = orderConfirmationTemplate(data);
    
    logger.info(
      { to, orderNumber: data.orderNumber },
      'Sending order confirmation email',
    );

    return this.client.send({
      to,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html,
      tags: [
        { name: 'type', value: 'order-confirmation' },
        { name: 'order', value: data.orderNumber },
      ],
    });
  }

  /**
   * Send order shipped email
   */
  async sendOrderShipped(
    to: string,
    data: OrderShippedData,
  ): Promise<SendEmailResult> {
    const html = orderShippedTemplate(data);
    
    logger.info(
      { to, orderNumber: data.orderNumber },
      'Sending order shipped email',
    );

    return this.client.send({
      to,
      subject: `Your Order Has Shipped - ${data.orderNumber}`,
      html,
      tags: [
        { name: 'type', value: 'order-shipped' },
        { name: 'order', value: data.orderNumber },
      ],
    });
  }

  /**
   * Send order cancelled email
   */
  async sendOrderCancelled(
    to: string,
    data: OrderCancelledData,
  ): Promise<SendEmailResult> {
    const html = orderCancelledTemplate(data);
    
    logger.info(
      { to, orderNumber: data.orderNumber },
      'Sending order cancelled email',
    );

    return this.client.send({
      to,
      subject: `Order Cancelled - ${data.orderNumber}`,
      html,
      tags: [
        { name: 'type', value: 'order-cancelled' },
        { name: 'order', value: data.orderNumber },
      ],
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    to: string,
    data: PasswordResetData,
  ): Promise<SendEmailResult> {
    const html = passwordResetTemplate(data);
    
    logger.info({ to }, 'Sending password reset email');

    return this.client.send({
      to,
      subject: 'Reset Your Password - SN Auto Parts',
      html,
      tags: [{ name: 'type', value: 'password-reset' }],
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcome(
    to: string,
    data: WelcomeData,
  ): Promise<SendEmailResult> {
    const html = welcomeTemplate(data);
    
    logger.info({ to }, 'Sending welcome email');

    return this.client.send({
      to,
      subject: 'Welcome to SN Auto Parts!',
      html,
      tags: [{ name: 'type', value: 'welcome' }],
    });
  }

  /**
   * Send low stock alert email
   */
  async sendLowStockAlert(
    to: string | string[],
    data: LowStockAlertData,
  ): Promise<SendEmailResult> {
    const html = lowStockAlertTemplate(data);
    
    logger.info(
      { to, alertCount: data.totalAlerts },
      'Sending low stock alert email',
    );

    return this.client.send({
      to,
      subject: `Low Stock Alert - ${data.totalAlerts} Product${data.totalAlerts === 1 ? '' : 's'}`,
      html,
      tags: [{ name: 'type', value: 'low-stock-alert' }],
    });
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

// Export for backwards compatibility
export const emailService = new EmailService();

