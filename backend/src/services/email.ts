import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resendApiKey);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  if (!config.resendApiKey) {
    console.log('Email service not configured. Would send:', options);
    return { success: true, mock: true };
  }

  try {
    const result = await resend.emails.send({
      from: config.emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (order: {
    orderNumber: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }) => ({
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #f6f7f8; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color: #137fec; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thank You for Your Order!</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #111418; font-size: 16px; margin-bottom: 24px;">
        Hi ${order.customerName},
      </p>
      <p style="color: #617589; font-size: 14px; margin-bottom: 24px;">
        We've received your order and are getting it ready. Here's what you ordered:
      </p>
      <div style="background-color: #f6f7f8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <p style="color: #111418; font-weight: bold; margin: 0 0 8px 0;">Order #${order.orderNumber}</p>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dbe0e6;">
            <span style="color: #111418;">${item.name} x${item.quantity}</span>
            <span style="color: #111418; font-weight: bold;">$${item.price.toFixed(2)}</span>
          </div>
        `).join('')}
        <div style="padding-top: 16px; margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; color: #617589; font-size: 14px; margin-bottom: 8px;">
            <span>Subtotal</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #617589; font-size: 14px; margin-bottom: 8px;">
            <span>Shipping</span>
            <span>${order.shipping === 0 ? 'Free' : '$' + order.shipping.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #617589; font-size: 14px; margin-bottom: 16px;">
            <span>Tax</span>
            <span>$${order.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #111418; font-size: 18px; font-weight: bold; border-top: 2px solid #dbe0e6; padding-top: 16px;">
            <span>Total</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <p style="color: #617589; font-size: 14px;">
        We'll send you another email when your order ships.
      </p>
    </div>
    <div style="background-color: #f6f7f8; padding: 24px; text-align: center; border-top: 1px solid #dbe0e6;">
      <p style="color: #617589; font-size: 12px; margin: 0;">
        Questions? Contact us at support@snautoparts.com
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  passwordReset: (resetLink: string, userName: string) => ({
    subject: 'Reset Your Password - SN Auto Parts',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #f6f7f8; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color: #137fec; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Reset Your Password</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #111418; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #617589; font-size: 14px;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="background-color: #137fec; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #617589; font-size: 12px;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  orderShipped: (order: {
    orderNumber: string;
    customerName: string;
    trackingNumber: string;
    carrier: string;
  }) => ({
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Shipped</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #f6f7f8; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color: #16a34a; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Order is On Its Way!</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #111418; font-size: 16px;">Hi ${order.customerName},</p>
      <p style="color: #617589; font-size: 14px;">
        Great news! Your order #${order.orderNumber} has shipped.
      </p>
      <div style="background-color: #f6f7f8; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <p style="color: #617589; font-size: 12px; margin: 0 0 8px 0;">TRACKING NUMBER</p>
        <p style="color: #111418; font-size: 18px; font-weight: bold; margin: 0;">${order.trackingNumber}</p>
        <p style="color: #617589; font-size: 14px; margin: 16px 0 0 0;">Shipped via ${order.carrier}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  }),
};

