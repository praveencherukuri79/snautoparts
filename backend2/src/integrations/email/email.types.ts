/**
 * Email Integration Types
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[] | EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  id: string;
  success: boolean;
}

export interface EmailClientConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * Template Data Types
 */
export interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  orderDate: Date;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OrderShippedData {
  customerName: string;
  orderNumber: string;
  shipments: Array<{
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
  }>;
}

export interface PasswordResetData {
  customerName: string;
  resetUrl: string;
  expiresIn: string;
}

export interface WelcomeData {
  customerName: string;
  loginUrl: string;
}

export interface LowStockAlertData {
  alerts: Array<{
    sku: string;
    name: string;
    currentQuantity: number;
    threshold: number;
  }>;
  totalAlerts: number;
}

export interface OrderCancelledData {
  customerName: string;
  orderNumber: string;
  reason?: string;
  refundAmount?: string;
}

